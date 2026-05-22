import { Router } from "express";
import { leaderboard } from "../controllers/contest.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const leaderboardRouter = Router();

leaderboardRouter.get("/contest/:id", asyncHandler(leaderboard));

