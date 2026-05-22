import { Router } from "express";
import * as certificate from "../controllers/certificate.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const certificateRouter = Router();

certificateRouter.get("/verify/:certificateId", asyncHandler(certificate.verify));
certificateRouter.post("/generate", verifyAccessToken, requireRole("admin"), asyncHandler(certificate.generate));
certificateRouter.get("/my", verifyAccessToken, requireRole("student"), asyncHandler(certificate.mine));
certificateRouter.get("/:id/download", verifyAccessToken, requireRole("student"), asyncHandler(certificate.download));

