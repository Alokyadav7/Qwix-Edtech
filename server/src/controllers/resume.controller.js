import { Job } from "../models/Job.js";
import { Resume } from "../models/Resume.js";
import { Student } from "../models/Student.js";
import { aiService } from "../services/ai.service.js";
import { generateResumePdf, listResumeTemplates } from "../services/pdf.service.js";
import { getSignedDownloadUrl, uploadBuffer } from "../services/s3.service.js";
import { ApiError } from "../utils/ApiError.js";
import { extractKeywords } from "../utils/helpers.js";

async function ownedResume(request) {
  const student = await Student.findOne({ user: request.user.id });
  const resume = await Resume.findOne({ _id: request.params.id, student: student.id });
  if (!resume) throw new ApiError(404, "Resume was not found.");
  return { student, resume };
}

export async function createResume(request, response) {
  const student = await Student.findOne({ user: request.user.id });
  const resume = await Resume.create({
    student: student.id,
    name: request.body.name,
    templateId: request.body.templateId,
    data: { name: request.user.name, skills: student.skills, summary: "", experience: [], education: [], projects: [] }
  });
  response.status(201).json({ success: true, data: { resume } });
}

export async function mine(request, response) {
  const student = await Student.findOne({ user: request.user.id });
  response.json({ success: true, data: { resumes: await Resume.find({ student: student.id }).sort({ updatedAt: -1 }) } });
}

export async function getResume(request, response) {
  response.json({ success: true, data: { resume: (await ownedResume(request)).resume } });
}

export async function updateResume(request, response) {
  const { resume } = await ownedResume(request);
  resume.versions.push({ data: resume.data, savedAt: new Date() });
  Object.assign(resume, request.body);
  await resume.save();
  response.json({ success: true, data: { resume } });
}

export async function deleteResume(request, response) {
  const { resume } = await ownedResume(request);
  await resume.deleteOne();
  response.status(204).end();
}

export async function aiSuggest(request, response) {
  await ownedResume(request);
  const suggestion = await aiService.resumeSuggestion(request.body);
  response.json({ success: true, data: suggestion });
}

export async function analyzeAts(request, response) {
  const { resume } = await ownedResume(request);
  const analysis = await aiService.analyzeResume({ resume: resume.data, jobDescription: request.body.jobDescription });
  resume.atsScore = analysis.atsScore;
  resume.atsFeedback = analysis;
  resume.lastAnalyzed = new Date();
  resume.keywords = analysis.keywordsPresent ?? extractKeywords(request.body.jobDescription);
  await resume.save();
  response.json({ success: true, data: analysis });
}

export async function exportPdf(request, response) {
  const { resume } = await ownedResume(request);
  const pdf = await generateResumePdf(resume);
  resume.pdfUrl = await uploadBuffer({ buffer: pdf, contentType: "application/pdf", folder: "resumes", filename: `${resume.name}.pdf` });
  await resume.save();
  response.json({ success: true, data: { url: await getSignedDownloadUrl(resume.pdfUrl) } });
}

export async function templates(_request, response) {
  response.json({ success: true, data: { templates: listResumeTemplates() } });
}

export async function importLinkedIn(_request, response) {
  response.status(202).json({ success: true, message: "Upload LinkedIn JSON export data to the resume update endpoint for deterministic import." });
}

export async function optimizeForJob(request, response) {
  const { resume } = await ownedResume(request);
  const job = await Job.findById(request.body.jobId);
  if (!job) throw new ApiError(404, "Job was not found.");
  const changes = await aiService.resumeSuggestion({ type: "job-optimization", resume: resume.data, job });
  response.json({ success: true, data: changes });
}

