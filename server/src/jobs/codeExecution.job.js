import mongoose from "mongoose";
import { getIO } from "../config/socket.js";
import { getRedis } from "../config/redis.js";
import { Contest } from "../models/Contest.js";
import { ContestSubmission } from "../models/ContestSubmission.js";
import { User } from "../models/User.js";
import { runAgainstTestCases } from "../services/judge0.service.js";
import { getQueue } from "./queues.js";

export const codeExecutionQueue = getQueue("code-execution");

codeExecutionQueue?.process(async (job) => processCodeExecution(job.data.submissionId));

export async function queueCodeExecution(submissionId) {
  if (!codeExecutionQueue) {
    return processCodeExecution(submissionId);
  }
  return codeExecutionQueue.add({ submissionId }, { attempts: 2, backoff: 1500 });
}

async function processCodeExecution(submissionId) {
  const submission = await ContestSubmission.findById(submissionId);
  if (!submission) return null;

  const contest = await Contest.findById(submission.contest);
  const problem = contest?.problems.id(submission.problem);
  if (!contest || !problem) return null;

  // Execute against all test cases
  const execution = await runAgainstTestCases(
    submission.code,
    submission.language,
    problem.testCases
  );
  submission.verdict = execution.verdict;
  submission.testCasesPassed = execution.passed;
  submission.totalTestCases = execution.total;
  submission.executionTime = execution.time;
  submission.memoryUsed = execution.memory;
  submission.score = execution.total
    ? Math.round((execution.passed / execution.total) * (problem.points ?? 100))
    : 0;
  submission.isChecked = true;
  await submission.save();

  // Update Redis leaderboard sorted set with tiebreak encoding
  const redis = getRedis();
  const boardKey = `contest:${contest.id}:lb`;
  if (redis) {
    // Higher encoded score = better rank; within same raw score, earlier submission wins
    const encodedScore =
      submission.score * 10_000_000_000 +
      (9_999_999_999 - Math.floor(submission.submittedAt.getTime() / 1000));
    await redis.zAdd(boardKey, [{ score: encodedScore, value: submission.user.toString() }]);
    await redis.expire(boardKey, 60 * 60 * 24); // 24h TTL
  }

  // Notify submitting user of their result
  const namespace = getIO()?.of("/contest");
  namespace?.to(`user:${submission.user}`).emit("submission-result", {
    submissionId: submission.id,
    verdict: submission.verdict,
    score: submission.score,
    passed: submission.testCasesPassed,
    total: submission.totalTestCases
  });

  // Broadcast full hydrated leaderboard to all contest participants
  const board = await hydrateLeaderboard(contest.id, redis);
  namespace?.to(`contest:${contest.id}`).emit("leaderboard-update", {
    contestId: contest.id,
    leaderboard: board
  });

  return submission;
}

/**
 * Read the Redis sorted set, hydrate user details, return a ranked array.
 * Falls back to a MongoDB aggregate when Redis is unavailable.
 */
export async function hydrateLeaderboard(contestId, redis) {
  const client = redis ?? getRedis();
  const contestOid = new mongoose.Types.ObjectId(contestId);

  let userIds = [];
  if (client) {
    userIds = await client.zRange(`contest:${contestId}:lb`, 0, 49, { REV: true });
  }

  if (!userIds.length) {
    const best = await ContestSubmission.aggregate([
      { $match: { contest: contestOid } },
      {
        $group: {
          _id: "$user",
          score: { $max: "$score" },
          lastSubmission: { $max: "$submittedAt" }
        }
      },
      { $sort: { score: -1, lastSubmission: 1 } },
      { $limit: 50 }
    ]);
    userIds = best.map((r) => String(r._id));
  }

  if (!userIds.length) return [];

  const userOids = userIds.map((id) => new mongoose.Types.ObjectId(String(id)));

  const [users, scores] = await Promise.all([
    User.find({ _id: { $in: userOids } }).select("name avatar"),
    ContestSubmission.aggregate([
      { $match: { contest: contestOid, user: { $in: userOids } } },
      {
        $group: {
          _id: "$user",
          score: { $max: "$score" },
          problemsSolved: { $sum: { $cond: [{ $eq: ["$verdict", "AC"] }, 1, 0] } },
          lastSubmission: { $max: "$submittedAt" }
        }
      }
    ])
  ]);

  return userIds.map((id, index) => {
    const user = users.find((u) => u.id === String(id));
    const score = scores.find((s) => String(s._id) === String(id));
    return {
      rank: index + 1,
      userId: id,
      name: user?.name ?? "Unknown",
      avatar: user?.avatar ?? null,
      score: score?.score ?? 0,
      problemsSolved: score?.problemsSolved ?? 0,
      lastSubmission: score?.lastSubmission ?? null
    };
  });
}
