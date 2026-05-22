import { Router } from "express";
import * as student from "../controllers/student.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const studentRouter = Router();

studentRouter.use(verifyAccessToken, requireRole("student"));
studentRouter.get("/me", asyncHandler(student.profile));
studentRouter.patch("/me", asyncHandler(student.updateProfile));
studentRouter.get("/dashboard", asyncHandler(student.dashboard));

