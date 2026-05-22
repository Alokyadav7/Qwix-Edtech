import { College } from "../models/College.js";
import { Contest } from "../models/Contest.js";
import { Student } from "../models/Student.js";
import { ApiError } from "../utils/ApiError.js";

export async function profile(request, response) {
  const college = await College.findOne({ user: request.user.id }).populate("user", "name email avatar");
  if (!college) throw new ApiError(404, "College profile was not found.");
  response.json({ success: true, data: { college } });
}

export async function updateProfile(request, response) {
  const college = await College.findOneAndUpdate({ user: request.user.id }, request.body, { new: true, runValidators: true });
  if (!college) throw new ApiError(404, "College profile was not found.");
  response.json({ success: true, data: { college } });
}

export async function dashboard(request, response) {
  const [students, contests] = await Promise.all([
    Student.countDocuments(),
    Contest.countDocuments({ createdBy: request.user.id })
  ]);
  response.json({ success: true, data: { students, contests } });
}

