import { Router } from "express";
import * as chat from "../controllers/chat.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const chatRouter = Router();

chatRouter.use(verifyAccessToken);
chatRouter.get("/conversations", asyncHandler(chat.conversations));
chatRouter.get("/:userId/messages", asyncHandler(chat.messages));
chatRouter.post("/:userId/send", asyncHandler(chat.send));
chatRouter.patch("/:userId/read-all", asyncHandler(chat.markConversationRead));
chatRouter.patch("/message/:id/read", asyncHandler(chat.markRead));
chatRouter.delete("/message/:id", asyncHandler(chat.remove));


