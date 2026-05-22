import { InterviewSession } from "../models/InterviewSession.js";
import { Student } from "../models/Student.js";
import { aiService } from "../services/ai.service.js";
import { clearSessionTimer, emitEvaluation } from "../sockets/interview.socket.js";
import { ApiError } from "../utils/ApiError.js";

async function studentForUser(userId) {
  const student = await Student.findOne({ user: userId });
  if (!student) throw new ApiError(404, "Student profile was not found.");
  return student;
}

async function ownedSession(request) {
  const student = await studentForUser(request.user.id);
  const session = await InterviewSession.findOne({
    _id: request.params.sessionId,
    student: student.id
  });
  if (!session) throw new ApiError(404, "Interview session was not found.");
  return session;
}

export async function startInterview(request, response) {
  const student = await studentForUser(request.user.id);
  const generated = await aiService.generateInterviewQuestions(request.body);
  const session = await InterviewSession.create({
    ...request.body,
    student: student.id,
    questions: generated.questions
  });
  response.status(201).json({
    success: true,
    data: {
      sessionId: session.id,
      // Hide expectedPoints from client — revealed only during evaluation
      questions: session.questions.map(({ expectedPoints, ...q }) => q)
    }
  });
}

export async function respond(request, response) {
  const session = await ownedSession(request);
  const question = session.questions[request.body.questionIndex];
  if (!question) throw new ApiError(404, "Interview question was not found.");

  const evaluation = await aiService.evaluateInterviewAnswer({
    question: question.question,
    expectedPoints: question.expectedPoints,
    answer: request.body.answer
  });

  session.responses.push({
    question: question.question,
    userAnswer: request.body.answer,
    ...evaluation
  });
  await session.save();

  // Notify any connected socket listeners (e.g., proctor / second device)
  emitEvaluation(session.id, evaluation);

  response.json({ success: true, data: evaluation });
}

export async function endInterview(request, response) {
  const session = await ownedSession(request);
  if (session.status === "completed") {
    return response.json({ success: true, data: { session } });
  }

  const report = await aiService.finishInterview(session);
  Object.assign(session, {
    status: "completed",
    completedAt: new Date(),
    overallScore: report.overallScore,
    overallFeedback: report.overallFeedback,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    finalReport: report
  });
  await session.save();

  // Stop any server-side countdown
  clearSessionTimer(session.id);

  return response.json({ success: true, data: { session } });
}

export async function mine(request, response) {
  const student = await studentForUser(request.user.id);
  const sessions = await InterviewSession.find({ student: student.id })
    .select("sessionType targetRole difficulty overallScore status createdAt completedAt")
    .sort({ createdAt: -1 });
  response.json({ success: true, data: { sessions } });
}

export async function getSession(request, response) {
  response.json({ success: true, data: { session: await ownedSession(request) } });
}

export async function analytics(request, response) {
  const student = await studentForUser(request.user.id);
  const sessions = await InterviewSession.find({ student: student.id, status: "completed" });

  const byCategory = sessions.reduce((acc, s) => {
    if (!acc[s.sessionType]) acc[s.sessionType] = [];
    acc[s.sessionType].push(s.overallScore ?? 0);
    return acc;
  }, {});

  const categoryAverages = Object.fromEntries(
    Object.entries(byCategory).map(([type, scores]) => [
      type,
      Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    ])
  );

  response.json({
    success: true,
    data: {
      totalSessions: sessions.length,
      averageScore: sessions.length
        ? Math.round(
            sessions.reduce((sum, s) => sum + (s.overallScore ?? 0), 0) / sessions.length
          )
        : 0,
      scoreOverTime: sessions.map((s) => ({ date: s.completedAt, score: s.overallScore })),
      categoryAverages,
      weakAreas: [...new Set(sessions.flatMap((s) => s.weaknesses))].slice(0, 10),
      strongAreas: [...new Set(sessions.flatMap((s) => s.strengths))].slice(0, 10)
    }
  });
}

export async function quickQuestion(request, response) {
  const generated = await aiService.generateInterviewQuestions({
    sessionType: "technical",
    targetRole: request.body.topic,
    difficulty: request.body.difficulty ?? "medium",
    duration: 5,
    skills: [request.body.topic]
  });
  const q = generated.questions[0];
  // Strip expectedPoints from quick-question response
  const { expectedPoints, ...publicQuestion } = q ?? {};
  response.json({ success: true, data: { question: publicQuestion } });
}

// Voice interview: accept audio blob URL, transcribe via Whisper, evaluate
export async function respondVoice(request, response) {
  const session = await ownedSession(request);
  const question = session.questions[request.body.questionIndex];
  if (!question) throw new ApiError(404, "Interview question was not found.");

  // Transcription from pre-uploaded audio URL (client uploads to S3 first)
  const transcription = await aiService.transcribeAudio(request.body.audioUrl);

  const evaluation = await aiService.evaluateInterviewAnswer({
    question: question.question,
    expectedPoints: question.expectedPoints,
    answer: transcription
  });

  session.responses.push({
    question: question.question,
    userAnswer: transcription,
    audioUrl: request.body.audioUrl,
    ...evaluation
  });
  await session.save();

  emitEvaluation(session.id, evaluation);

  response.json({ success: true, data: { transcription, evaluation } });
}
