import { Router } from "express";
import * as aitest from "../controllers/aitest.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const aitestRouter = Router();

aitestRouter.use(verifyAccessToken);
aitestRouter.post("/generate", requireRole("student"), asyncHandler(aitest.generate));
aitestRouter.get("/my-attempts", requireRole("student"), asyncHandler(aitest.myAttempts));
aitestRouter.get("/recommended", requireRole("student"), asyncHandler(aitest.recommended));
aitestRouter.post("/company-create", requireRole("company"), asyncHandler(aitest.companyCreate));
aitestRouter.get("/company/results", requireRole("company"), asyncHandler(aitest.companyResults));
aitestRouter.post("/assign/:testId", requireRole("company"), asyncHandler(aitest.assign));
aitestRouter.post("/:testId/start", requireRole("student"), asyncHandler(aitest.start));
aitestRouter.post("/:testId/submit", requireRole("student"), asyncHandler(aitest.submit));
aitestRouter.get("/:testId/attempt/:attemptId", requireRole("student"), asyncHandler(aitest.getAttempt));
aitestRouter.get("/:testId/next-question", requireRole("student"), asyncHandler(aitest.nextQuestion));

