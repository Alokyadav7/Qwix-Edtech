import { body } from "express-validator";
import { Router } from "express";
import * as contest from "../controllers/contest.controller.js";
import { optionalAuth, verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const contestRouter = Router();

contestRouter.get("/", optionalAuth, asyncHandler(contest.listContests));
contestRouter.get("/:id", optionalAuth, asyncHandler(contest.getContest));
contestRouter.get("/:id/leaderboard", asyncHandler(contest.leaderboard));
contestRouter.post("/", verifyAccessToken, requireRole("admin", "company"), body("title").notEmpty(), validate, asyncHandler(contest.createContest));
contestRouter.post("/:id/register", verifyAccessToken, requireRole("student"), asyncHandler(contest.registerContest));
contestRouter.post("/:id/submit", verifyAccessToken, requireRole("student"), body("problemId").notEmpty(), body("code").notEmpty(), body("language").notEmpty(), validate, asyncHandler(contest.submitCode));
contestRouter.get("/:id/my-submissions", verifyAccessToken, requireRole("student"), asyncHandler(contest.mySubmissions));
contestRouter.get("/:id/problems", verifyAccessToken, requireRole("student"), asyncHandler(contest.contestProblems));

