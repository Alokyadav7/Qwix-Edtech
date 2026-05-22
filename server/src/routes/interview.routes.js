import { Router } from "express";
import * as interview from "../controllers/interview.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const interviewRouter = Router();

interviewRouter.use(verifyAccessToken, requireRole("student"));
interviewRouter.get("/my", asyncHandler(interview.mine));
interviewRouter.get("/analytics", asyncHandler(interview.analytics));
interviewRouter.post("/quick-question", asyncHandler(interview.quickQuestion));
interviewRouter.post("/start", asyncHandler(interview.startInterview));
interviewRouter.post("/:sessionId/respond", asyncHandler(interview.respond));
interviewRouter.post("/:sessionId/respond-voice", asyncHandler(interview.respondVoice));
interviewRouter.post("/:sessionId/end", asyncHandler(interview.endInterview));
interviewRouter.get("/:sessionId", asyncHandler(interview.getSession));

