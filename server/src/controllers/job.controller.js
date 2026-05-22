import { redisGetJson, redisSetJson } from "../config/redis.js";
import { Application } from "../models/Application.js";
import { Company } from "../models/Company.js";
import { Job } from "../models/Job.js";
import { Student } from "../models/Student.js";
import { createNotification } from "../services/notification.service.js";
import { ApiError } from "../utils/ApiError.js";
import { calculateATSScore, extractKeywords, pageOptions, textArray } from "../utils/helpers.js";

async function companyForUser(userId) {
  const company = await Company.findOne({ user: userId });
  if (!company) throw new ApiError(404, "Company profile was not found.");
  return company;
}

function buildFilters(query) {
  const filters = { status: "active" };
  if (query.search) filters.$text = { $search: query.search };
  if (query.location) filters.location = new RegExp(query.location, "i");
  if (query.type) filters.type = query.type;
  if (query.workMode) filters.workMode = query.workMode;
  if (query.salaryMin) filters.salaryMax = { $gte: Number(query.salaryMin) };
  if (query.salaryMax) filters.salaryMin = { ...(filters.salaryMin ?? {}), $lte: Number(query.salaryMax) };
  if (query.skills) filters.skills = { $in: textArray(query.skills) };
  if (query.experience) filters.experienceMin = { $lte: Number(query.experience) };
  return filters;
}

export async function createJob(request, response) {
  const company = await companyForUser(request.user.id);
  const atsKeywords = [...new Set([
    ...extractKeywords(request.body.description),
    ...textArray(request.body.skills),
    ...(request.body.requirements ?? []).flatMap((item) => extractKeywords(item))
  ])];
  const job = await Job.create({ ...request.body, company: company.id, atsKeywords });

  const matchingStudents = await Student.find({ skills: { $in: job.skills } }).limit(25).populate("user");
  await Promise.all(matchingStudents.map((student) => createNotification({
    userId: student.user.id,
    type: "job_match",
    title: `New job match: ${job.title}`,
    body: `${company.companyName ?? "A company"} posted a role matching your profile.`,
    action: `/jobs/${job.id}`
  })));

  response.status(201).json({ success: true, data: { job } });
}

export async function listJobs(request, response) {
  const cacheKey = `jobs:${JSON.stringify(request.query)}:${request.user?.id ?? "public"}`;
  const cached = await redisGetJson(cacheKey);
  if (cached) return response.json({ success: true, data: cached, cached: true });

  const { page, limit, skip } = pageOptions(request.query);
  const sort = request.query.sort === "salary" ? { salaryMax: -1 } : { createdAt: -1 };
  const [jobs, total] = await Promise.all([
    Job.find(buildFilters(request.query)).populate("company").sort(sort).skip(skip).limit(limit),
    Job.countDocuments(buildFilters(request.query))
  ]);

  let payload = { jobs, page, limit, total };
  if (request.user?.role === "student" && request.query.sort === "relevance") {
    const student = await Student.findOne({ user: request.user.id });
    payload = {
      ...payload,
      jobs: jobs
        .map((job) => ({ job, matchScore: calculateATSScore({ skills: student.skills }, job).score }))
        .sort((left, right) => right.matchScore - left.matchScore)
    };
  }
  await redisSetJson(cacheKey, payload, 300);
  return response.json({ success: true, data: payload });
}

export async function getJob(request, response) {
  const job = await Job.findByIdAndUpdate(request.params.id, { $inc: { views: 1 } }, { new: true }).populate("company");
  if (!job) throw new ApiError(404, "Job was not found.");
  const data = { job };
  if (request.user?.role === "student") {
    const student = await Student.findOne({ user: request.user.id });
    data.hasApplied = Boolean(await Application.exists({ student: student.id, job: job.id }));
    data.matchScore = calculateATSScore({ skills: student.skills, projects: student.projects }, job).score;
  }
  response.json({ success: true, data });
}

export async function updateJob(request, response) {
  const company = await companyForUser(request.user.id);
  const job = await Job.findOneAndUpdate({ _id: request.params.id, company: company.id }, request.body, { new: true, runValidators: true });
  if (!job) throw new ApiError(404, "Job was not found.");
  response.json({ success: true, data: { job } });
}

export async function updateJobStatus(request, response) {
  request.body = { status: request.body.status };
  return updateJob(request, response);
}

export async function deleteJob(request, response) {
  const company = request.user.role === "admin" ? null : await companyForUser(request.user.id);
  const deleted = await Job.findOneAndDelete({ _id: request.params.id, ...(company ? { company: company.id } : {}) });
  if (!deleted) throw new ApiError(404, "Job was not found.");
  response.status(204).end();
}

export async function companyListings(request, response) {
  const company = await companyForUser(request.user.id);
  const jobs = await Job.find({ company: company.id }).sort({ createdAt: -1 });
  response.json({ success: true, data: { jobs } });
}
