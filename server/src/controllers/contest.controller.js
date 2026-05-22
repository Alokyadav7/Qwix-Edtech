import mongoose from "mongoose";
import { queueCodeExecution, hydrateLeaderboard } from "../jobs/codeExecution.job.js";
import { Contest } from "../models/Contest.js";
import { ContestSubmission } from "../models/ContestSubmission.js";
import { Student } from "../models/Student.js";
import { ApiError } from "../utils/ApiError.js";

function duringContest(contest) {
  const now = new Date();
  return contest.status === "live" || (contest.startTime <= now && contest.endTime >= now);
}

export async function createContest(request, response) {
  const contest = await Contest.create({ ...request.body, createdBy: request.user.id });
  response.status(201).json({ success: true, data: { contest } });
}

export async function listContests(request, response) {
  const filters = {};
  if (request.query.status) filters.status = request.query.status;
  if (request.query.type) filters.type = request.query.type;
  const contests = await Contest.find(filters).select("-problems.testCases").sort({ startTime: 1 });
  response.json({
    success: true,
    data: {
      contests: contests.map((contest) => ({
        ...contest.toJSON(),
        participantsCount: contest.registeredUsers.length,
        timeRemaining: Math.max(0, contest.endTime.getTime() - Date.now()),
        registered: request.user ? contest.registeredUsers.some((userId) => userId.equals(request.user.id)) : false
      }))
    }
  });
}

export async function getContest(request, response) {
  const contest = await Contest.findById(request.params.id);
  if (!contest) throw new ApiError(404, "Contest was not found.");
  const registered = request.user && contest.registeredUsers.some((userId) => userId.equals(request.user.id));
  const data = contest.toJSON();
  if (!registered || !duringContest(contest)) {
    data.problems = data.problems.map(({ title, difficulty, points, _id }) => ({ title, difficulty, points, _id }));
  }
  response.json({ success: true, data: { contest: data, registered } });
}

export async function registerContest(request, response) {
  const contest = await Contest.findById(request.params.id);
  const student = await Student.findOne({ user: request.user.id });
  if (!contest || !student) throw new ApiError(404, "Contest or student profile was not found.");
  if (contest.endTime < new Date()) throw new ApiError(409, "Contest registration is closed.");
  if (contest.maxParticipants && contest.registeredUsers.length >= contest.maxParticipants) throw new ApiError(409, "Contest is full.");
  if (!contest.registeredUsers.some((userId) => userId.equals(request.user.id))) {
    contest.registeredUsers.push(request.user.id);
    await contest.save();
    await Student.updateOne({ _id: student.id }, { $inc: { "stats.contestsParticipated": 1 } });
  }
  response.json({ success: true, data: { contestId: contest.id, registered: true } });
}

export async function submitCode(request, response) {
  const contest = await Contest.findById(request.params.id);
  if (!contest || !duringContest(contest)) throw new ApiError(409, "Contest is not accepting submissions.");
  if (!contest.registeredUsers.some((userId) => userId.equals(request.user.id))) throw new ApiError(403, "Register before submitting.");
  const problem = contest.problems.id(request.body.problemId);
  if (!problem) throw new ApiError(404, "Contest problem was not found.");
  const submission = await ContestSubmission.create({
    contest: contest.id,
    problem: problem.id,
    user: request.user.id,
    code: request.body.code,
    language: request.body.language,
    totalTestCases: problem.testCases.length
  });
  await queueCodeExecution(submission.id);
  response.status(202).json({ success: true, data: { submissionId: submission.id } });
}

export async function leaderboard(request, response) {
  const contestId = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(contestId)) {
    throw new ApiError(400, "Invalid contest ID.");
  }
  const board = await hydrateLeaderboard(contestId);
  response.json({ success: true, data: { leaderboard: board } });
}

export async function mySubmissions(request, response) {
  const submissions = await ContestSubmission.find({ contest: request.params.id, user: request.user.id }).sort({ submittedAt: -1 });
  response.json({ success: true, data: { submissions } });
}

export async function contestProblems(request, response) {
  const contest = await Contest.findById(request.params.id);
  if (!contest || !duringContest(contest) || !contest.registeredUsers.some((userId) => userId.equals(request.user.id))) throw new ApiError(403, "Problems are available only to registered participants during the contest.");
  response.json({ success: true, data: { problems: contest.problems.map((problem) => {
    const value = problem.toJSON();
    delete value.testCases;
    return value;
  }) } });
}
