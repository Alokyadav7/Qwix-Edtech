import { Router } from "express";
import { body } from "express-validator";
import * as internship from "../controllers/internship.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const internshipRouter = Router();

internshipRouter.get("/", asyncHandler(internship.listInternships));
internshipRouter.get("/company/my-listings", verifyAccessToken, requireRole("company", "admin"), asyncHandler(internship.companyListings));
internshipRouter.get("/:id", asyncHandler(internship.getInternship));
internshipRouter.post("/", verifyAccessToken, requireRole("company"), body("title").notEmpty(), body("description").notEmpty(), validate, asyncHandler(internship.createInternship));
internshipRouter.patch("/:id", verifyAccessToken, requireRole("company"), asyncHandler(internship.updateInternship));
internshipRouter.put("/:id/status", verifyAccessToken, requireRole("company"), body("status").isIn(["draft", "active", "paused", "closed"]), validate, asyncHandler(internship.updateStatus));
internshipRouter.delete("/:id", verifyAccessToken, requireRole("company", "admin"), asyncHandler(internship.deleteInternship));


