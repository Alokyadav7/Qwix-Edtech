import { Router } from "express";
import * as resume from "../controllers/resume.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const resumeRouter = Router();

resumeRouter.get("/templates", asyncHandler(resume.templates));
resumeRouter.use(verifyAccessToken, requireRole("student"));
resumeRouter.post("/", asyncHandler(resume.createResume));
resumeRouter.get("/my", asyncHandler(resume.mine));
resumeRouter.post("/import-linkedin", asyncHandler(resume.importLinkedIn));
resumeRouter.get("/:id", asyncHandler(resume.getResume));
resumeRouter.put("/:id", asyncHandler(resume.updateResume));
resumeRouter.delete("/:id", asyncHandler(resume.deleteResume));
resumeRouter.post("/:id/ai-suggest", asyncHandler(resume.aiSuggest));
resumeRouter.post("/:id/analyze-ats", asyncHandler(resume.analyzeAts));
resumeRouter.post("/:id/export-pdf", asyncHandler(resume.exportPdf));
resumeRouter.post("/:id/optimize-for-job", asyncHandler(resume.optimizeForJob));

