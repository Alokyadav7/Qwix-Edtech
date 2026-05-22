import { Router } from "express";
import * as ai from "../controllers/ai.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const aiRouter = Router();

aiRouter.use(verifyAccessToken, requireRole("student"));
aiRouter.post("/career-path", asyncHandler(ai.careerPath));
aiRouter.post("/skill-gap", asyncHandler(ai.skillGap));
aiRouter.post("/chatbot", asyncHandler(ai.chatbot));
aiRouter.post("/cover-letter", asyncHandler(ai.coverLetter));
aiRouter.post("/salary-insight", asyncHandler(ai.salaryInsight));

