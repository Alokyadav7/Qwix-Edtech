import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("MONGODB_URI is not set. Database-backed routes are unavailable.");
    return;
  }

  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
  }
}

