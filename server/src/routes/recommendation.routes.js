import { Router } from "express";
import * as student from "../controllers/student.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const recommendationRouter = Router();

recommendationRouter.use(verifyAccessToken, requireRole("student"));
recommendationRouter.get("/jobs", asyncHandler(student.recommendedJobs));
recommendationRouter.get("/contests", asyncHandler(student.recommendedContests));
recommendationRouter.get("/peers", asyncHandler(student.recommendedPeers));

