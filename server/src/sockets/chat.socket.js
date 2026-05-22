import { getRedis } from "../config/redis.js";
import { ChatMessage } from "../models/ChatMessage.js";

function conversationId(left, right) {
  return [left, right].sort().join(":");
}

export function registerChatSocket(namespace) {
  namespace.on("connection", (socket) => {
    socket.on("join-chat", ({ conversationId: room }) => socket.join(room));
    socket.on("presence", async ({ userId }) => {
      if (!userId) return;
      socket.data.userId = userId;
      await getRedis()?.set(`user:${userId}:online`, "1", { EX: 60 });
      namespace.emit("user-online", { userId });
    });
    socket.on("heartbeat", async ({ userId }) => getRedis()?.set(`user:${userId}:online`, "1", { EX: 60 }));
    socket.on("send-message", async ({ senderId, receiverId, content, type = "text" }) => {
      const room = conversationId(senderId, receiverId);
      const message = await ChatMessage.create({
        conversation: room,
        participants: [senderId, receiverId],
        sender: senderId,
        content,
        type
      });
      namespace.to(room).emit("new-message", message);
      socket.emit("message-delivered", { messageId: message.id });
    });
    socket.on("typing-start", ({ receiverId, userId }) => namespace.to(conversationId(receiverId, userId)).emit("user-typing", { userId }));
    socket.on("typing-stop", ({ receiverId, userId }) => namespace.to(conversationId(receiverId, userId)).emit("user-stopped-typing", { userId }));
    socket.on("disconnect", async () => {
      if (!socket.data.userId) return;
      await getRedis()?.del(`user:${socket.data.userId}:online`);
      namespace.emit("user-offline", { userId: socket.data.userId });
    });
  });
}

