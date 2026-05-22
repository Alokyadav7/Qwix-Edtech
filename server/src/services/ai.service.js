import OpenAI from "openai";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const openai = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;

function requireOpenAI() {
  if (!openai) {
    throw new ApiError(503, "OpenAI is not configured.");
  }
  return openai;
}

async function jsonResponse(instructions, input) {
  const client = requireOpenAI();
  const response = await client.responses.create({
    model: env.openaiModel,
    instructions,
    input,
    text: { format: { type: "json_object" } }
  });
  return JSON.parse(response.output_text);
}

export const aiService = {
  generateInterviewQuestions(payload) {
    return jsonResponse(
      `You are an expert ${payload.sessionType} interviewer. Return valid JSON with questions array. Each question has id, question, category, difficulty, expectedPoints, followUps.`,
      `Role: ${payload.targetRole}. Company: ${payload.targetCompany ?? "top tech company"}. Difficulty: ${payload.difficulty}. Skills: ${(payload.skills ?? []).join(", ")}. Duration: ${payload.duration} minutes.`
    );
  },
  evaluateInterviewAnswer({ question, expectedPoints, answer }) {
    return jsonResponse(
      "You are a strict but fair interviewer. Return JSON with score, verdict, feedback, strengths, improvements, idealAnswer, followUpQuestion.",
      `Question: ${question}\nExpected key points: ${JSON.stringify(expectedPoints)}\nCandidate answer: ${answer}`
    );
  },
  finishInterview(session) {
    return jsonResponse(
      "Return JSON with overallScore, grade, overallFeedback, strengths, weaknesses, topicsToRevise, readyForInterview, estimatedInterviewReadiness, studyPlan.",
      JSON.stringify({ questions: session.questions, responses: session.responses })
    );
  },
  generateTest(payload) {
    return jsonResponse(
      "Generate an interview-style assessment. Return valid JSON with title and questions. Question types may include mcq, true-false, coding, subjective.",
      JSON.stringify(payload)
    );
  },
  gradeSubjective({ question, keyPoints, answer, points }) {
    return jsonResponse(
      "Evaluate one subjective answer. Return JSON with score, feedback, coveredPoints, missingPoints.",
      JSON.stringify({ question, keyPoints, answer, maxScore: points })
    );
  },
  testFeedback(payload) {
    return jsonResponse(
      "Return JSON with topicsToImprove, strongTopics, studyRecommendations, estimatedLevel.",
      JSON.stringify(payload)
    );
  },
  resumeSuggestion(payload) {
    return jsonResponse(
      "Return actionable resume writing suggestions as valid JSON.",
      JSON.stringify(payload)
    );
  },
  analyzeResume(payload) {
    return jsonResponse(
      "Analyze ATS compatibility. Return JSON with atsScore, sections, topIssues, quickWins, overallFeedback, keywordsToAdd, keywordsPresent.",
      JSON.stringify(payload)
    );
  },
  careerJson(kind, payload) {
    return jsonResponse(`You are CareerBot. Return valid JSON for ${kind}.`, JSON.stringify(payload));
  },
  async streamText({ instructions, input, onToken }) {
    const stream = await requireOpenAI().responses.create({
      model: env.openaiModel,
      instructions,
      input,
      stream: true
    });
    let fullResponse = "";
    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        fullResponse += event.delta;
        onToken?.(event.delta);
      }
    }
    return fullResponse;
  },

  // Whisper transcription from a publicly-accessible audio URL
  async transcribeAudio(audioUrl) {
    const client = requireOpenAI();
    const response = await fetch(audioUrl);
    if (!response.ok) throw new ApiError(400, "Could not fetch audio file.");
    const audioBuffer = await response.arrayBuffer();
    const blob = new Blob([audioBuffer]);
    const transcription = await client.audio.transcriptions.create({
      model: "whisper-1",
      file: new File([blob], "audio.webm", { type: "audio/webm" })
    });
    return transcription.text;
  },

  suggestResumeSections(payload) {
    return jsonResponse(
      "Return a JSON array of improvement suggestions, each with section, issue, suggestion, priority (high|medium|low).",
      JSON.stringify(payload)
    );
  },

  optimizeForJobDescription({ resumeData, jobDescription }) {
    return jsonResponse(
      "Return JSON with tailoredSummary, keywordsToAdd, keywordsPresent, sectionsToReorder, updatedBullets (array of { original, improved } pairs).",
      JSON.stringify({ resumeData, jobDescription })
    );
  }
};


