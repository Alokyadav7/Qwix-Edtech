import { Server } from "socket.io";
import { env } from "./env.js";
import { registerChatSocket } from "../sockets/chat.socket.js";
import { registerContestSocket } from "../sockets/contest.socket.js";
import { registerInterviewSocket } from "../sockets/interview.socket.js";
import { registerNotificationSocket } from "../sockets/notification.socket.js";

let io;

export function attachSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: env.allowedOrigins,
      credentials: true
    }
  });

  registerContestSocket(io.of("/contest"));
  registerInterviewSocket(io.of("/interview"));
  registerNotificationSocket(io.of("/notifications"));
  registerChatSocket(io.of("/chat"));
  appSocketNamespace().on("connection", (socket) => socket.emit("connected", { socketId: socket.id }));
  return io;
}

export function getIO() {
  return io;
}

export function appSocketNamespace() {
  return io?.of("/") ?? { on() {} };
}

