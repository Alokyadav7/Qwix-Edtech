import { body } from "express-validator";
import { Router } from "express";
import * as application from "../controllers/application.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const applicationRouter = Router();

applicationRouter.post("/", verifyAccessToken, requireRole("student"), asyncHandler(application.apply));
applicationRouter.get("/my", verifyAccessToken, requireRole("student"), asyncHandler(application.mine));
applicationRouter.get("/job/:jobId", verifyAccessToken, requireRole("company"), asyncHandler(application.jobApplicants));
applicationRouter.patch("/:id/status", verifyAccessToken, requireRole("company"), body("status").isIn(["screening", "shortlisted", "interview", "offered", "rejected"]), validate, asyncHandler(application.updateStatus));
applicationRouter.post("/:id/withdraw", verifyAccessToken, requireRole("student"), asyncHandler(application.withdraw));
applicationRouter.get("/stats", verifyAccessToken, requireRole("company"), asyncHandler(application.stats));

