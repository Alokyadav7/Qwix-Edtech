import { getRedis } from "../config/redis.js";
import { Job } from "../models/Job.js";
import { Student } from "../models/Student.js";
import { aiService } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";
import { extractKeywords } from "../utils/helpers.js";

async function studentForUser(userId) {
  const student = await Student.findOne({ user: userId });
  if (!student) throw new ApiError(404, "Student profile was not found.");
  return student;
}

export async function careerPath(request, response) {
  response.json({ success: true, data: await aiService.careerJson("career path", request.body) });
}

export async function skillGap(request, response) {
  const student = await studentForUser(request.user.id);
  const required = [...new Set((request.body.jobDescriptions ?? []).flatMap(extractKeywords))];
  const presentSkills = required.filter((skill) => student.skills.map((item) => item.toLowerCase()).includes(skill));
  const missingSkills = required.filter((skill) => !presentSkills.includes(skill));
  response.json({
    success: true,
    data: await aiService.careerJson("skill gap", { targetRole: request.body.targetRole, missingSkills, presentSkills })
  });
}

export async function chatbot(request, response) {
  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.flushHeaders();
  const history = request.body.conversationHistory ?? [];
  const fullResponse = await aiService.streamText({
    instructions: "You are CareerBot for a student opportunity platform. Be specific and actionable.",
    input: JSON.stringify([...history, { role: "user", content: request.body.message }]),
    onToken: (token) => response.write(`data: ${JSON.stringify({ token })}\n\n`)
  });
  await getRedis()?.set(`careerbot:${request.user.id}`, JSON.stringify([...history, { role: "assistant", content: fullResponse }]), { EX: 3600 });
  response.write(`event: done\ndata: ${JSON.stringify({ done: true })}\n\n`);
  response.end();
}

export async function coverLetter(request, response) {
  const job = await Job.findById(request.body.jobId);
  if (!job) throw new ApiError(404, "Job was not found.");
  response.json({ success: true, data: await aiService.careerJson("cover letter", { ...request.body, job }) });
}

export async function salaryInsight(request, response) {
  response.json({ success: true, data: await aiService.careerJson("India salary insight", request.body) });
}

