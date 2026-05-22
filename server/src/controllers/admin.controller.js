import { getRedis } from "../config/redis.js";
import { Application } from "../models/Application.js";
import { College } from "../models/College.js";
import { Company } from "../models/Company.js";
import { Contest } from "../models/Contest.js";
import { Job } from "../models/Job.js";
import { Notification } from "../models/Notification.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { sendBulkNotification } from "../services/notification.service.js";
import { ApiError } from "../utils/ApiError.js";
import { pageOptions } from "../utils/helpers.js";

function since(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function stats(_request, response) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalUsers, students, companies, colleges, today, thisWeek,
    jobs, activeJobs, applications,
    contests, live, upcoming,
    revenueAll, revenueToday, revenueMonth
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "company" }),
    User.countDocuments({ role: "college" }),
    User.countDocuments({ createdAt: { $gte: since(1) } }),
    User.countDocuments({ createdAt: { $gte: since(7) } }),
    Job.countDocuments(),
    Job.countDocuments({ status: "active" }),
    Application.countDocuments(),
    Contest.countDocuments(),
    Contest.countDocuments({ status: "live" }),
    Contest.countDocuments({ status: "upcoming" }),
    Payment.aggregate([{ $match: { status: "success" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $match: { status: "success", createdAt: { $gte: startOfToday } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $match: { status: "success", createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }])
  ]);

  const redis = getRedis();
  // activeNow: count Redis online keys (pattern scan — acceptable for admin use)
  let activeNow = 0;
  if (redis) {
    try {
      const keys = await redis.keys("user:*:online");
      activeNow = keys.length;
    } catch {
      activeNow = 0;
    }
  }

  response.json({
    success: true,
    data: {
      users: { total: totalUsers, students, companies, colleges, today, thisWeek },
      jobs: { total: jobs, active: activeJobs, applications },
      contests: { total: contests, live, upcoming },
      revenue: {
        total: revenueAll[0]?.total ?? 0,
        today: revenueToday[0]?.total ?? 0,
        thisMonth: revenueMonth[0]?.total ?? 0
      },
      activeNow
    }
  });
}

export async function users(request, response) {
  const { page, limit, skip } = pageOptions(request.query);
  const filters = {};
  if (request.query.role) filters.role = request.query.role;
  if (request.query.search) filters.$or = [{ name: new RegExp(request.query.search, "i") }, { email: new RegExp(request.query.search, "i") }];
  response.json({ success: true, data: { users: await User.find(filters).skip(skip).limit(limit), page, limit } });
}

export async function toggleBan(request, response) {
  const user = await User.findById(request.params.id);
  if (!user) throw new ApiError(404, "User was not found.");
  user.isActive = !user.isActive;
  await user.save();
  response.json({ success: true, data: { user } });
}

export async function verifyUser(request, response) {
  const model = request.body.role === "college" ? College : Company;
  const profile = await model.findOneAndUpdate({ user: request.params.id }, { isVerified: true }, { new: true });
  if (!profile) throw new ApiError(404, "Profile was not found.");
  response.json({ success: true, data: { profile } });
}

export async function removeUser(request, response) {
  const user = await User.findByIdAndDelete(request.params.id);
  if (!user) throw new ApiError(404, "User was not found.");
  response.status(204).end();
}

export async function pendingCompanies(_request, response) {
  response.json({ success: true, data: { companies: await Company.find({ isVerified: false }).populate("user", "name email") } });
}

export async function approveCompany(request, response) {
  const company = await Company.findByIdAndUpdate(request.params.id, { isVerified: true }, { new: true });
  if (!company) throw new ApiError(404, "Company was not found.");
  response.json({ success: true, data: { company } });
}

export async function rejectCompany(request, response) {
  const company = await Company.findByIdAndUpdate(request.params.id, { isVerified: false, verificationDoc: undefined }, { new: true });
  if (!company) throw new ApiError(404, "Company was not found.");
  response.json({ success: true, data: { company } });
}

export async function flaggedJobs(_request, response) {
  response.json({ success: true, data: { jobs: await Job.find({ reportedCount: { $gt: 0 } }).populate("company") } });
}

export async function removeJob(request, response) {
  await Job.findByIdAndDelete(request.params.id);
  response.status(204).end();
}

export async function announcement(request, response) {
  const userIds = await User.find({ isActive: true }).distinct("_id");
  const notifications = await sendBulkNotification({
    userIds,
    type: "system",
    title: request.body.title,
    body: request.body.body,
    data: request.body.data
  });
  response.status(201).json({ success: true, data: { sent: notifications.length } });
}

export async function revenueChart(_request, response) {
  const chart = await Payment.aggregate([
    { $match: { status: "success" } },
    { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, total: { $sum: "$amount" } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
  response.json({ success: true, data: { chart } });
}

export async function activityLog(_request, response) {
  const activity = await Notification.find().sort({ createdAt: -1 }).limit(50);
  response.json({ success: true, data: { activity } });
}

