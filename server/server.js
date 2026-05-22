import http from "node:http";
import { app } from "./src/app.js";
import { connectDatabase, disconnectDatabase } from "./src/config/database.js";
import { env } from "./src/config/env.js";
import { connectRedis, disconnectRedis } from "./src/config/redis.js";
import { attachSocketServer } from "./src/config/socket.js";
import { closeQueues } from "./src/jobs/queues.js";

const server = http.createServer(app);
attachSocketServer(server);

async function start() {
  await connectDatabase();
  await connectRedis();

  server.listen(env.port, () => {
    console.log(`Student platform API listening on port ${env.port}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received, shutting down.`);
  server.close(async () => {
    await Promise.allSettled([disconnectDatabase(), disconnectRedis(), closeQueues()]);
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});

