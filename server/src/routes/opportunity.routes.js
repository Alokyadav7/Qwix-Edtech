import { Router } from "express";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { Application } from "../models/application.model.js";
import { Opportunity } from "../models/opportunity.model.js";

export const opportunityRouter = Router();

opportunityRouter.get("/", async (request, response, next) => {
  try {
    const { kind, search } = request.query;
    const filters = { status: "published" };

    if (kind) {
      filters.kind = kind;
    }

    if (search) {
      filters.$text = { $search: search };
    }

    const opportunities = await Opportunity.find(filters)
      .sort({ createdAt: -1 })
      .limit(30)
      .populate("createdBy", "name role organizationName");

    response.json({ opportunities });
  } catch (error) {
    next(error);
  }
});

opportunityRouter.post(
  "/",
  requireAuth,
  allowRoles("company", "admin"),
  async (request, response, next) => {
    try {
      const opportunity = await Opportunity.create({
        ...request.body,
        createdBy: request.user.id
      });

      response.status(201).json({ opportunity });
    } catch (error) {
      next(error);
    }
  }
);

opportunityRouter.post(
  "/:opportunityId/apply",
  requireAuth,
  allowRoles("student"),
  async (request, response, next) => {
    try {
      const opportunity = await Opportunity.findById(request.params.opportunityId);

      if (!opportunity || opportunity.status !== "published") {
        response.status(404);
        throw new Error("Opportunity is not available.");
      }

      const application = await Application.findOneAndUpdate(
        {
          opportunity: opportunity.id,
          student: request.user.id
        },
        {
          status: "applied"
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      response.status(201).json({ application });
    } catch (error) {
      next(error);
    }
  }
);

opportunityRouter.get(
  "/applications/mine",
  requireAuth,
  allowRoles("student"),
  async (request, response, next) => {
    try {
      const applications = await Application.find({ student: request.user.id })
        .sort({ updatedAt: -1 })
        .populate("opportunity");

      response.json({ applications });
    } catch (error) {
      next(error);
    }
  }
);

