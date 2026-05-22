import { redisGetJson, redisSetJson } from "../config/redis.js";
import { Contest } from "../models/Contest.js";
import { Job } from "../models/Job.js";
import { Student } from "../models/Student.js";
import { textArray } from "../utils/helpers.js";

function overlap(left = [], right = []) {
  const rightSet = new Set(right.map((item) => item.toLowerCase()));
  return left.filter((item) => rightSet.has(item.toLowerCase())).length;
}

export async function getJobRecommendations(studentId, limit = 10) {
  const cacheKey = `recommendations:${studentId}`;
  const cached = await redisGetJson(cacheKey);
  if (cached) {
    return cached;
  }

  const student = await Student.findById(studentId);
  const jobs = await Job.find({ status: "active" }).populate("company").limit(250);
  const recommendations = jobs
    .map((job) => {
      const skillScore = job.skills.length ? (overlap(student.skills, job.skills) / job.skills.length) * 40 : 0;
      const titleScore = overlap(textArray(student.preferredRoles), [job.title]) ? 25 : 0;
      const locationScore = !student.preferredLocations.length || student.preferredLocations.includes(job.location) ? 20 : 0;
      const salaryScore = job.salaryMax ? 10 : 0;
      return { job, score: Math.round(skillScore + titleScore + locationScore + salaryScore + 5) };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
  await redisSetJson(cacheKey, recommendations, 3600);
  return recommendations;
}

export async function getContestRecommendations(studentId, limit = 10) {
  const student = await Student.findById(studentId);
  return Contest.find({
    status: { $in: ["upcoming", "live"] },
    $or: [{ "eligibility.skills": { $in: student.skills } }, { "eligibility.skills": { $size: 0 } }]
  }).limit(limit);
}

export async function getSimilarProfiles(studentId, limit = 10) {
  const student = await Student.findById(studentId);
  return Student.find({
    _id: { $ne: student.id },
    $or: [{ skills: { $in: student.skills } }, { graduationYear: student.graduationYear }]
  })
    .populate("user", "name avatar")
    .limit(limit);
}

