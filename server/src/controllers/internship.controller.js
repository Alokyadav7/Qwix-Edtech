import { Company } from "../models/Company.js";
import { Internship } from "../models/Internship.js";
import { Student } from "../models/Student.js";
import { createNotification } from "../services/notification.service.js";
import { redisGetJson, redisSetJson } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";
import { extractKeywords, pageOptions, textArray } from "../utils/helpers.js";

async function ownedCompany(userId) {
  const company = await Company.findOne({ user: userId });
  if (!company) throw new ApiError(404, "Company profile was not found.");
  return company;
}

function buildFilters(query) {
  const filters = { status: "active" };
  if (query.search) filters.$text = { $search: query.search };
  if (query.location) filters.location = new RegExp(query.location, "i");
  if (query.workMode) filters.workMode = query.workMode;
  if (query.skills) filters.skills = { $in: textArray(query.skills) };
  if (query.stipendMin) filters.stipendMax = { $gte: Number(query.stipendMin) };
  if (query.stipendMax) filters.stipendMin = { ...(filters.stipendMin ?? {}), $lte: Number(query.stipendMax) };
  if (query.duration) filters.durationMonths = { $lte: Number(query.duration) };
  return filters;
}

export async function createInternship(request, response) {
  const company = await ownedCompany(request.user.id);
  const atsKeywords = [
    ...new Set([
      ...extractKeywords(request.body.description),
      ...textArray(request.body.skills)
    ])
  ];
  const internship = await Internship.create({
    ...request.body,
    company: company.id,
    atsKeywords
  });

  // Notify matching students
  const matchingStudents = await Student.find({ skills: { $in: internship.skills } })
    .limit(25)
    .populate("user");
  await Promise.all(
    matchingStudents.map((student) =>
      createNotification({
        userId: student.user.id,
        type: "job_match",
        title: `New internship match: ${internship.title}`,
        body: `${company.companyName} posted an internship matching your profile.`,
        action: `/internships/${internship.id}`
      })
    )
  );

  response.status(201).json({ success: true, data: { internship } });
}

export async function listInternships(request, response) {
  const cacheKey = `internships:${JSON.stringify(request.query)}`;
  const cached = await redisGetJson(cacheKey);
  if (cached) return response.json({ success: true, data: cached, cached: true });

  const { page, limit, skip } = pageOptions(request.query);
  const filters = buildFilters(request.query);
  const sort = request.query.sort === "stipend" ? { stipendMax: -1 } : { createdAt: -1 };

  const [internships, total] = await Promise.all([
    Internship.find(filters).populate("company").sort(sort).skip(skip).limit(limit),
    Internship.countDocuments(filters)
  ]);

  const payload = { internships, page, limit, total };
  await redisSetJson(cacheKey, payload, 300); // 5-minute cache
  return response.json({ success: true, data: payload });
}

export async function getInternship(request, response) {
  const internship = await Internship.findByIdAndUpdate(
    request.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).populate("company");
  if (!internship) throw new ApiError(404, "Internship was not found.");
  response.json({ success: true, data: { internship } });
}

export async function updateInternship(request, response) {
  const company = await ownedCompany(request.user.id);
  const internship = await Internship.findOneAndUpdate(
    { _id: request.params.id, company: company.id },
    request.body,
    { new: true, runValidators: true }
  );
  if (!internship) throw new ApiError(404, "Internship was not found.");
  response.json({ success: true, data: { internship } });
}

export async function deleteInternship(request, response) {
  const company = request.user.role === "admin" ? null : await ownedCompany(request.user.id);
  const internship = await Internship.findOneAndDelete({
    _id: request.params.id,
    ...(company ? { company: company.id } : {})
  });
  if (!internship) throw new ApiError(404, "Internship was not found.");
  response.status(204).end();
}

export async function companyListings(request, response) {
  const company = await ownedCompany(request.user.id);
  const internships = await Internship.find({ company: company.id }).sort({ createdAt: -1 });
  response.json({ success: true, data: { internships } });
}

export async function updateStatus(request, response) {
  const company = await ownedCompany(request.user.id);
  const internship = await Internship.findOneAndUpdate(
    { _id: request.params.id, company: company.id },
    { status: request.body.status },
    { new: true }
  );
  if (!internship) throw new ApiError(404, "Internship was not found.");
  response.json({ success: true, data: { internship } });
}
