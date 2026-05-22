import { Router } from "express";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { Application } from "../models/application.model.js";
import { ContestSubmission } from "../models/contest-submission.model.js";
import { Contest } from "../models/contest.model.js";
import { Opportunity } from "../models/opportunity.model.js";
import { Resume } from "../models/resume.model.js";
import { User } from "../models/user.model.js";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/student",
  requireAuth,
  allowRoles("student"),
  async (request, response, next) => {
    try {
      const [applications, resumes, contestSubmissions, recommendations] = await Promise.all([
        Application.countDocuments({ student: request.user.id }),
        Resume.countDocuments({ student: request.user.id }),
        ContestSubmission.countDocuments({ student: request.user.id }),
        Opportunity.find({
          status: "published",
          skills: { $in: request.user.skills }
        })
          .sort({ createdAt: -1 })
          .limit(6)
      ]);

      response.json({
        stats: {
          applications,
          resumes,
          contestSubmissions
        },
        recommendations
      });
    } catch (error) {
      next(error);
    }
  }
);

dashboardRouter.get(
  "/company",
  requireAuth,
  allowRoles("company", "admin"),
  async (request, response, next) => {
    try {
      const opportunityIds = await Opportunity.find({ createdBy: request.user.id }).distinct("_id");
      const [postedOpportunities, applications, contests] = await Promise.all([
        Opportunity.countDocuments({ createdBy: request.user.id }),
        Application.countDocuments({ opportunity: { $in: opportunityIds } }),
        Contest.countDocuments({ createdBy: request.user.id })
      ]);

      response.json({
        stats: {
          postedOpportunities,
          applications,
          contests
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

dashboardRouter.get(
  "/college",
  requireAuth,
  allowRoles("college", "admin"),
  async (request, response, next) => {
    try {
      const contests = await Contest.countDocuments({ createdBy: request.user.id });
      const students = await User.countDocuments({ role: "student" });

      response.json({
        stats: {
          contests,
          students
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

dashboardRouter.get(
  "/admin",
  requireAuth,
  allowRoles("admin"),
  async (_request, response, next) => {
    try {
      const [users, opportunities, contests, applications] = await Promise.all([
        User.countDocuments(),
        Opportunity.countDocuments(),
        Contest.countDocuments(),
        Application.countDocuments()
      ]);

      response.json({
        stats: {
          users,
          opportunities,
          contests,
          applications
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

