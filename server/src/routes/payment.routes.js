import { Router } from "express";
import * as payment from "../controllers/payment.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const paymentRouter = Router();

paymentRouter.post("/webhook", asyncHandler(payment.webhook));
paymentRouter.post("/create-order", verifyAccessToken, asyncHandler(payment.createOrder));
paymentRouter.post("/verify", verifyAccessToken, asyncHandler(payment.verify));
paymentRouter.get("/history", verifyAccessToken, asyncHandler(payment.history));

