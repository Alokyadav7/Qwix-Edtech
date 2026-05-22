import { Router } from "express";
import * as hackathon from "../controllers/hackathon.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const hackathonRouter = Router();

hackathonRouter.get("/", asyncHandler(hackathon.listHackathons));
hackathonRouter.get("/:id", asyncHandler(hackathon.getHackathon));
hackathonRouter.post("/", verifyAccessToken, requireRole("admin", "company"), upload.single("banner"), asyncHandler(hackathon.createHackathon));
hackathonRouter.post("/:id/register", verifyAccessToken, requireRole("student"), asyncHandler(hackathon.registerSolo));
hackathonRouter.post("/:id/create-team", verifyAccessToken, requireRole("student"), asyncHandler(hackathon.createTeam));
hackathonRouter.post("/:id/join-team", verifyAccessToken, requireRole("student"), asyncHandler(hackathon.joinTeam));
hackathonRouter.post("/:id/invite", verifyAccessToken, requireRole("student"), asyncHandler(hackathon.invite));
hackathonRouter.get("/:id/teams", asyncHandler(hackathon.teams));
hackathonRouter.post("/:id/submit", verifyAccessToken, requireRole("student"), asyncHandler(hackathon.submitProject));
hackathonRouter.get("/:id/submissions", verifyAccessToken, requireRole("admin"), asyncHandler(hackathon.submissions));
hackathonRouter.post("/:id/judge", verifyAccessToken, asyncHandler(hackathon.judge));
hackathonRouter.get("/:id/results", asyncHandler(hackathon.results));
hackathonRouter.post("/:id/announce", verifyAccessToken, requireRole("admin"), asyncHandler(hackathon.announce));

