import { Application } from "../models/Application.js";
import { Company } from "../models/Company.js";
import { Contest } from "../models/Contest.js";
import { Job } from "../models/Job.js";
import { ApiError } from "../utils/ApiError.js";

export async function profile(request, response) {
  const company = await Company.findOne({ user: request.user.id }).populate("user", "name email avatar");
  if (!company) throw new ApiError(404, "Company profile was not found.");
  response.json({ success: true, data: { company } });
}

export async function updateProfile(request, response) {
  const company = await Company.findOneAndUpdate({ user: request.user.id }, request.body, { new: true, runValidators: true });
  if (!company) throw new ApiError(404, "Company profile was not found.");
  response.json({ success: true, data: { company } });
}

export async function dashboard(request, response) {
  const company = await Company.findOne({ user: request.user.id });
  if (!company) throw new ApiError(404, "Company profile was not found.");
  const jobIds = await Job.find({ company: company.id }).distinct("_id");
  const [jobs, applications, contests] = await Promise.all([
    Job.countDocuments({ company: company.id }),
    Application.countDocuments({ job: { $in: jobIds } }),
    Contest.countDocuments({ sponsoredBy: company.id })
  ]);
  response.json({ success: true, data: { jobs, applications, contests } });
}

