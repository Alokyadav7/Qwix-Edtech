import Queue from "bull";
import { env } from "../config/env.js";

const queues = new Map();

export function getQueue(name) {
  if (!env.redisUrl) {
    return null;
  }

  if (!queues.has(name)) {
    queues.set(name, new Queue(name, env.redisUrl));
  }
  return queues.get(name);
}

export async function closeQueues() {
  await Promise.all([...queues.values()].map((queue) => queue.close()));
}

