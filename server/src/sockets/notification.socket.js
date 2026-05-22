import { getRedis } from "../config/redis.js";

export function registerNotificationSocket(namespace) {
  namespace.on("connection", (socket) => {
    socket.on("subscribe", async ({ userId }) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      const redis = getRedis();
      socket.emit("unread-count", { count: Number((await redis?.get(`notifications:${userId}:unread`)) ?? 0) });
    });
  });
}

