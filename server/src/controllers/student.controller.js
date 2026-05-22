import { Application } from "../models/Application.js";
import { Certificate } from "../models/Certificate.js";
import { Contest } from "../models/Contest.js";
import { Notification } from "../models/Notification.js";
import { Student } from "../models/Student.js";
import { getContestRecommendations, getJobRecommendations, getSimilarProfiles } from "../services/recommendation.service.js";
import { ApiError } from "../utils/ApiError.js";

export async function profile(request, response) {
  const student = await Student.findOne({ user: request.user.id }).populate("user", "name email avatar");
  if (!student) throw new ApiError(404, "Student profile was not found.");
  response.json({ success: true, data: { student } });
}

export async function updateProfile(request, response) {
  const student = await Student.findOneAndUpdate({ user: request.user.id }, request.body, { new: true, runValidators: true });
  if (!student) throw new ApiError(404, "Student profile was not found.");
  response.json({ success: true, data: { student } });
}

export async function dashboard(request, response) {
  const student = await Student.findOne({ user: request.user.id });
  if (!student) throw new ApiError(404, "Student profile was not found.");
  const [jobs, contests, applications, upcomingContests, certificates, unread] = await Promise.all([
    getJobRecommendations(student.id, 6),
    getContestRecommendations(student.id, 6),
    Application.find({ student: student.id }).sort({ updatedAt: -1 }).limit(8).populate("job internship"),
    Contest.find({ startTime: { $gte: new Date() } }).sort({ startTime: 1 }).limit(4),
    Certificate.find({ student: student.id }).sort({ issueDate: -1 }).limit(3),
    Notification.countDocuments({ user: request.user.id, isRead: false })
  ]);
  const missing = ["bio", "skills", "collegeName", "preferredRoles"].filter((key) => !student[key]?.length);
  response.json({
    success: true,
    data: {
      profile: { completeness: student.profileCompleteness, missing },
      recommendations: { jobs, contests },
      applications: { active: applications.filter((item) => !["rejected", "withdrawn"].includes(item.status)), recent: applications },
      upcomingContests,
      certificates: { count: await Certificate.countDocuments({ student: student.id }), recent: certificates },
      activityScore: Math.min(100, student.stats.applicationsSubmitted * 5 + student.stats.contestsParticipated * 10 + student.stats.certificatesEarned * 15),
      weeklyGoals: [{ goal: "Apply to 3 roles", completed: student.stats.applicationsSubmitted >= 3 }],
      notifications: { unread }
    }
  });
}

export async function recommendedJobs(request, response) {
  const student = await Student.findOne({ user: request.user.id });
  response.json({ success: true, data: { jobs: await getJobRecommendations(student.id) } });
}

export async function recommendedContests(request, response) {
  const student = await Student.findOne({ user: request.user.id });
  response.json({ success: true, data: { contests: await getContestRecommendations(student.id) } });
}

export async function recommendedPeers(request, response) {
  const student = await Student.findOne({ user: request.user.id });
  response.json({ success: true, data: { peers: await getSimilarProfiles(student.id) } });
}

