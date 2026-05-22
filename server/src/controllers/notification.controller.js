import { getRedis } from "../config/redis.js";
import { Notification } from "../models/Notification.js";
import { pageOptions } from "../utils/helpers.js";
import { ApiError } from "../utils/ApiError.js";

export async function list(request, response) {
  const { page, limit, skip } = pageOptions(request.query);
  const filters = { user: request.user.id };
  if (request.query.unreadOnly === "true") filters.isRead = false;
  const [notifications, total] = await Promise.all([
    Notification.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filters)
  ]);
  response.json({ success: true, data: { notifications, total, page, limit } });
}

export async function markRead(request, response) {
  const notification = await Notification.findOneAndUpdate(
    { _id: request.params.id, user: request.user.id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) throw new ApiError(404, "Notification was not found.");
  await getRedis()?.decr(`notifications:${request.user.id}:unread`);
  response.json({ success: true, data: { notification } });
}

export async function markAllRead(request, response) {
  await Notification.updateMany({ user: request.user.id, isRead: false }, { isRead: true, readAt: new Date() });
  await getRedis()?.set(`notifications:${request.user.id}:unread`, "0");
  response.json({ success: true, message: "Notifications marked read." });
}

export async function remove(request, response) {
  const notification = await Notification.findOneAndDelete({ _id: request.params.id, user: request.user.id });
  if (!notification) throw new ApiError(404, "Notification was not found.");
  response.status(204).end();
}

export async function unreadCount(request, response) {
  const redisCount = await getRedis()?.get(`notifications:${request.user.id}:unread`);
  const count = redisCount ? Number(redisCount) : await Notification.countDocuments({ user: request.user.id, isRead: false });
  response.json({ success: true, data: { count } });
}

