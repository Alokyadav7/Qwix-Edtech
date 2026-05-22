import { Router } from "express";
import * as college from "../controllers/college.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const collegeRouter = Router();

collegeRouter.use(verifyAccessToken, requireRole("college"));
collegeRouter.get("/me", asyncHandler(college.profile));
collegeRouter.patch("/me", asyncHandler(college.updateProfile));
collegeRouter.get("/dashboard", asyncHandler(college.dashboard));

