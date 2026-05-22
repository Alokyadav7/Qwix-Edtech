import { Router } from "express";
import * as company from "../controllers/company.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const companyRouter = Router();

companyRouter.use(verifyAccessToken, requireRole("company"));
companyRouter.get("/me", asyncHandler(company.profile));
companyRouter.patch("/me", asyncHandler(company.updateProfile));
companyRouter.get("/dashboard", asyncHandler(company.dashboard));

