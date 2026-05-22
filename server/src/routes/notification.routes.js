import { Router } from "express";
import * as notification from "../controllers/notification.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const notificationRouter = Router();

notificationRouter.use(verifyAccessToken);
notificationRouter.get("/", asyncHandler(notification.list));
notificationRouter.get("/unread-count", asyncHandler(notification.unreadCount));
notificationRouter.patch("/read-all", asyncHandler(notification.markAllRead));
notificationRouter.patch("/:id/read", asyncHandler(notification.markRead));
notificationRouter.delete("/:id", asyncHandler(notification.remove));

