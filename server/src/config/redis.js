import { createClient } from "redis";
import { env } from "./env.js";

let redisClient;

export function getRedis() {
  return redisClient;
}

export async function connectRedis() {
  if (!env.redisUrl) {
    console.warn("REDIS_URL is not set. Cache, presence, and queues use degraded mode.");
    return null;
  }

  redisClient = createClient({ url: env.redisUrl });
  redisClient.on("error", (error) => console.error("Redis error", error));
  await redisClient.connect();
  console.log("Redis connected");
  return redisClient;
}

export async function disconnectRedis() {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
}

export async function redisGetJson(key) {
  const value = await redisClient?.get(key);
  return value ? JSON.parse(value) : null;
}

export async function redisSetJson(key, value, ttlSeconds) {
  if (!redisClient) {
    return;
  }

  await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

