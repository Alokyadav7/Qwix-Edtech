import { getRedis } from "../config/redis.js";

export function registerContestSocket(namespace) {
  namespace.on("connection", (socket) => {
    // Track which contest rooms this socket has joined (for cleanup on disconnect)
    const joinedContests = new Set();

    socket.on("join-contest", async ({ contestId, userId }) => {
      socket.join(`contest:${contestId}`);
      joinedContests.add(contestId);

      if (userId) {
        socket.data.userId = userId;
        socket.join(`user:${userId}`);
      }

      const redis = getRedis();
      if (redis) {
        await redis.sAdd(`contest:${contestId}:active`, socket.id);
        const count = await redis.sCard(`contest:${contestId}:active`);
        namespace.to(`contest:${contestId}`).emit("participant-count", { count });
      }
    });

    socket.on("leave-contest", async ({ contestId }) => {
      socket.leave(`contest:${contestId}`);
      joinedContests.delete(contestId);

      const redis = getRedis();
      if (redis) {
        await redis.sRem(`contest:${contestId}:active`, socket.id);
        const count = await redis.sCard(`contest:${contestId}:active`);
        namespace.to(`contest:${contestId}`).emit("participant-count", { count });
      }
    });

    // Anti-cheat: log code-change events
    socket.on("code-change", ({ contestId, problemId, code, userId }) => {
      getRedis()?.rPush(
        `contest:${contestId}:proctoring:${userId ?? socket.data.userId}`,
        JSON.stringify({
          action: "code-change",
          problemId,
          length: code?.length ?? 0,
          date: new Date()
        })
      );
    });

    // Anti-cheat: count tab switches / focus loss
    socket.on("anti-cheat", async ({ contestId, action }) => {
      const userId = socket.data.userId;
      if (!userId) return;
      const redis = getRedis();
      if (!redis) return;

      const key = `contest:${contestId}:switches:${userId}`;
      const count = await redis.incr(key);
      await redis.expire(key, 60 * 60 * 6);

      // Log the event
      await redis.rPush(
        `contest:${contestId}:proctoring:${userId}`,
        JSON.stringify({ action, count, date: new Date() })
      );

      if (count > 3) {
        namespace.to(`contest:${contestId}:admins`).emit("anti-cheat-alert", {
          userId,
          action,
          count
        });
      }
    });

    socket.on("heartbeat", ({ contestId }) => {
      socket.emit("time-sync", { serverTime: Date.now(), contestId });
    });

    // Clean up Redis active-participant sets on disconnect
    socket.on("disconnect", async () => {
      const redis = getRedis();
      if (!redis) return;

      for (const contestId of joinedContests) {
        await redis.sRem(`contest:${contestId}:active`, socket.id);
        const count = await redis.sCard(`contest:${contestId}:active`);
        namespace.to(`contest:${contestId}`).emit("participant-count", { count });
      }
    });
  });
}
