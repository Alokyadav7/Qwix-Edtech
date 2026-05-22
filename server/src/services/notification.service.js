import { getIO } from "../config/socket.js";
import { getRedis } from "../config/redis.js";
import { emailQueue } from "../jobs/email.job.js";
import { Notification } from "../models/Notification.js";

export async function createNotification({ userId, type, title, body, data, action, sender }) {
  const notification = await Notification.create({ user: userId, type, title, body, data, action, sender });
  const namespace = getIO()?.of("/notifications");
  namespace?.to(`user:${userId}`).emit("new-notification", notification);

  const redis = getRedis();
  if (redis) {
    await redis.incr(`notifications:${userId}:unread`);
  }

  if (["application_update", "interview_scheduled", "certificate_earned"].includes(type)) {
    emailQueue?.add({ to: data?.email, subject: title, text: body, html: `<p>${body}</p>` });
  }
  return notification;
}

export async function sendBulkNotification({ userIds, type, title, body, data }) {
  const notifications = await Notification.insertMany(
    userIds.map((userId) => ({ user: userId, type, title, body, data }))
  );
  const namespace = getIO()?.of("/notifications");
  notifications.forEach((notification) => namespace?.to(`user:${notification.user}`).emit("new-notification", notification));
  return notifications;
}

export async function scheduleNotification({ userId, type, data, sendAt }) {
  const queue = emailQueue;
  if (!queue) {
    return null;
  }
  return queue.add({ userId, type, data }, { delay: Math.max(0, new Date(sendAt).getTime() - Date.now()) });
}

