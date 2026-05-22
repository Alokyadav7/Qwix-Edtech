import { AITest } from "../models/AITest.js";
import { AITestAttempt } from "../models/AITestAttempt.js";
import { Company } from "../models/Company.js";
import { Student } from "../models/Student.js";
import { env } from "../config/env.js";
import { aiService } from "../services/ai.service.js";
import { runAgainstTestCases } from "../services/judge0.service.js";
import { queueEmail } from "../jobs/email.job.js";
import { ApiError } from "../utils/ApiError.js";

async function studentForUser(userId) {
  const student = await Student.findOne({ user: userId });
  if (!student) throw new ApiError(404, "Student profile was not found.");
  return student;
}

function hideAnswers(question) {
  const { correctAnswer, explanation, keyPoints, testCases, ...publicQuestion } = question;
  return publicQuestion;
}

export async function generate(request, response) {
  const generated = await aiService.generateTest(request.body);
  const test = await AITest.create({
    ...request.body,
    title: generated.title ?? `${request.body.topic} assessment`,
    questions: generated.questions,
    createdBy: "ai"
  });
  response.status(201).json({ success: true, data: { testId: test.id } });
}

export async function start(request, response) {
  const student = await studentForUser(request.user.id);
  const test = await AITest.findById(request.params.testId);
  if (!test) throw new ApiError(404, "AI test was not found.");
  const attempt = await AITestAttempt.create({ student: student.id, aiTest: test.id });
  response.status(201).json({
    success: true,
    data: {
      attemptId: attempt.id,
      questions: test.questions.map(hideAnswers),
      startTime: attempt.startedAt,
      duration: test.duration
    }
  });
}

export async function submit(request, response) {
  const student = await studentForUser(request.user.id);
  const [test, attempt] = await Promise.all([
    AITest.findById(request.params.testId),
    AITestAttempt.findOne({ _id: request.body.attemptId, student: student.id, status: "in-progress" })
  ]);
  if (!test || !attempt) throw new ApiError(404, "Test attempt was not found.");
  if (Date.now() - attempt.startedAt.getTime() > test.duration * 60 * 1000 + 5000) {
    attempt.status = "expired";
    await attempt.save();
    throw new ApiError(409, "Test timer expired.");
  }

  const graded = [];
  for (const answer of request.body.answers ?? []) {
    const question = test.questions.find((item) => item.id === answer.questionId);
    if (!question) continue;
    let score = 0;
    let feedback;
    if (["mcq", "true-false"].includes(question.type)) {
      score = String(answer.answer) === String(question.correctAnswer) ? Number(question.points ?? 0) : 0;
    } else if (question.type === "coding") {
      const result = await runAgainstTestCases(answer.code, answer.language, question.testCases);
      score = result.total ? Math.round((result.passed / result.total) * Number(question.points ?? 0)) : 0;
      feedback = result;
    } else {
      feedback = await aiService.gradeSubjective({ question: question.question, keyPoints: question.keyPoints, answer: answer.answer, points: question.points });
      score = Number(feedback.score ?? 0);
    }
    graded.push({ ...answer, score, isCorrect: score >= Number(question.points ?? 0), feedback });
  }

  const maxScore = test.questions.reduce((sum, question) => sum + Number(question.points ?? 0), 0);
  const totalScore = graded.reduce((sum, answer) => sum + answer.score, 0);
  const feedback = await aiService.testFeedback({
    topic: test.topic,
    score: totalScore,
    maxScore,
    wrongQuestions: graded.filter((answer) => !answer.isCorrect)
  });
  Object.assign(attempt, {
    answers: graded,
    totalScore,
    maxScore,
    percentage: maxScore ? Math.round((totalScore / maxScore) * 100) : 0,
    timeTaken: Math.round((Date.now() - attempt.startedAt.getTime()) / 1000),
    completedAt: new Date(),
    status: "submitted",
    feedback,
    topicsToImprove: feedback.topicsToImprove,
    strongTopics: feedback.strongTopics
  });
  await attempt.save();
  response.json({ success: true, data: { attempt, questions: test.questions } });
}

export async function myAttempts(request, response) {
  const student = await studentForUser(request.user.id);
  const attempts = await AITestAttempt.find({ student: student.id }).populate("aiTest", "title topic").sort({ createdAt: -1 });
  response.json({ success: true, data: { attempts } });
}

export async function getAttempt(request, response) {
  const student = await studentForUser(request.user.id);
  const attempt = await AITestAttempt.findOne({ _id: request.params.attemptId, student: student.id }).populate("aiTest");
  if (!attempt) throw new ApiError(404, "Attempt was not found.");
  response.json({ success: true, data: { attempt } });
}

export async function recommended(request, response) {
  const student = await studentForUser(request.user.id);
  const attempts = await AITestAttempt.find({ student: student.id }).sort({ createdAt: -1 }).limit(10);
  const recommendations = await aiService.careerJson("recommended tests", { weakTopics: attempts.flatMap((attempt) => attempt.topicsToImprove).slice(0, 12) });
  response.json({ success: true, data: recommendations });
}

export async function companyCreate(request, response) {
  const company = await Company.findOne({ user: request.user.id });
  const generated = await aiService.generateTest(request.body);
  const test = await AITest.create({ ...request.body, title: generated.title, questions: generated.questions, createdBy: "company", company: company.id });
  response.status(201).json({ success: true, data: { test } });
}

export async function assign(request, response) {
  await Promise.all((request.body.emails ?? []).map((email) => queueEmail({
    to: email,
    subject: "Hiring assessment assigned",
    text: `${env.frontendUrl}/tests/${request.params.testId}`,
    html: `<p>Complete the assessment assigned to you.</p>`
  })));
  response.json({ success: true, message: "Assignments queued." });
}

export async function companyResults(request, response) {
  const company = await Company.findOne({ user: request.user.id });
  const tests = await AITest.find({ company: company.id }).distinct("_id");
  const results = await AITestAttempt.find({ aiTest: { $in: tests }, status: "submitted" }).populate({ path: "student", populate: "user" }).sort({ percentage: -1 });
  response.json({ success: true, data: { results } });
}

export async function nextQuestion(request, response) {
  const test = await AITest.findById(request.params.testId);
  const currentIndex = Number(request.query.currentIndex ?? 0);
  const question = test?.questions[currentIndex + 1];
  if (!question) throw new ApiError(404, "No next question is available.");
  response.json({ success: true, data: { question: hideAnswers(question) } });
}
