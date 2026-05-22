import dotenv from "dotenv";

dotenv.config();

function list(value, fallback) {
  return (value ?? fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  allowedOrigins: list(process.env.ALLOWED_ORIGINS, "http://localhost:5173"),
  mongoUri: process.env.MONGODB_URI ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "development-access-secret-change-me",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "development-refresh-secret-change-me",
  jwtAccessExpire: process.env.JWT_ACCESS_EXPIRE ?? "15m",
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE ?? "7d",
  refreshCookieName: process.env.REFRESH_COOKIE_NAME ?? "student_platform_refresh",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? ""
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID ?? "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    callbackUrl: process.env.GITHUB_CALLBACK_URL ?? ""
  },
  sendgridApiKey: process.env.SENDGRID_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "noreply@studentplatform.test",
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    region: process.env.AWS_REGION ?? "ap-south-1",
    bucket: process.env.AWS_S3_BUCKET ?? ""
  },
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o",
  judge0: {
    url: process.env.JUDGE0_API_URL ?? "",
    apiKey: process.env.JUDGE0_API_KEY ?? "",
    host: process.env.JUDGE0_API_HOST ?? ""
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? "",
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? ""
  }
};
