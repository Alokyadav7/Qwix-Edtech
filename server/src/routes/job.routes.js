import { body } from "express-validator";
import { Router } from "express";
import * as job from "../controllers/job.controller.js";
import { optionalAuth, verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const jobRouter = Router();

jobRouter.get("/", optionalAuth, asyncHandler(job.listJobs));
jobRouter.get("/company/my-listings", verifyAccessToken, requireRole("company", "admin"), asyncHandler(job.companyListings));
jobRouter.get("/:id", optionalAuth, asyncHandler(job.getJob));
jobRouter.post("/", verifyAccessToken, requireRole("company"), body("title").notEmpty(), body("description").notEmpty(), validate, asyncHandler(job.createJob));
jobRouter.patch("/:id", verifyAccessToken, requireRole("company"), asyncHandler(job.updateJob));
jobRouter.put("/:id/status", verifyAccessToken, requireRole("company"), body("status").isIn(["draft", "active", "paused", "closed"]), validate, asyncHandler(job.updateJobStatus));
jobRouter.delete("/:id", verifyAccessToken, requireRole("company", "admin"), asyncHandler(job.deleteJob));

