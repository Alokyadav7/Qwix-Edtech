import { Router } from "express";
import * as admin from "../controllers/admin.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const adminRouter = Router();

adminRouter.use(verifyAccessToken, requireRole("admin"));
adminRouter.get("/stats", asyncHandler(admin.stats));
adminRouter.get("/users", asyncHandler(admin.users));
adminRouter.patch("/users/:id/ban", asyncHandler(admin.toggleBan));
adminRouter.patch("/users/:id/verify", asyncHandler(admin.verifyUser));
adminRouter.delete("/users/:id", asyncHandler(admin.removeUser));
adminRouter.get("/companies/pending-verification", asyncHandler(admin.pendingCompanies));
adminRouter.patch("/companies/:id/approve", asyncHandler(admin.approveCompany));
adminRouter.patch("/companies/:id/reject", asyncHandler(admin.rejectCompany));
adminRouter.get("/jobs/flagged", asyncHandler(admin.flaggedJobs));
adminRouter.delete("/jobs/:id", asyncHandler(admin.removeJob));
adminRouter.post("/announcements", asyncHandler(admin.announcement));
adminRouter.get("/revenue/chart", asyncHandler(admin.revenueChart));
adminRouter.get("/activity-log", asyncHandler(admin.activityLog));

