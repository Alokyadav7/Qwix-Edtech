import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import { env } from "./config/env.js";
import { passport } from "./config/passport.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { generalLimiter } from "./middlewares/rateLimit.middleware.js";
import { aiRouter } from "./routes/ai.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { aitestRouter } from "./routes/aitest.routes.js";
import { applicationRouter } from "./routes/application.routes.js";
import { certificateRouter } from "./routes/certificate.routes.js";
import { chatRouter } from "./routes/chat.routes.js";
import { collegeRouter } from "./routes/college.routes.js";
import { companyRouter } from "./routes/company.routes.js";
import { contestRouter } from "./routes/contest.routes.js";
import { hackathonRouter } from "./routes/hackathon.routes.js";
import { internshipRouter } from "./routes/internship.routes.js";
import { interviewRouter } from "./routes/interview.routes.js";
import { jobRouter } from "./routes/job.routes.js";
import { leaderboardRouter } from "./routes/leaderboard.routes.js";
import { notificationRouter } from "./routes/notification.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";
import { recommendationRouter } from "./routes/recommendation.routes.js";
import { resumeRouter } from "./routes/resume.routes.js";
import { studentRouter } from "./routes/student.routes.js";
import { adminRouter } from "./routes/admin.routes.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.allowedOrigins,
    credentials: true
  })
);
app.use(express.json({
  limit: "10mb",
  verify(request, _response, buffer) {
    if (request.originalUrl === "/api/payments/webhook") {
      request.rawBody = buffer;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(passport.initialize());
app.use(generalLimiter);

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "student-opportunity-platform-api"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/students", studentRouter);
app.use("/api/student", studentRouter);
app.use("/api/companies", companyRouter);
app.use("/api/colleges", collegeRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/internships", internshipRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/contests", contestRouter);
app.use("/api/hackathons", hackathonRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/ai", aiRouter);
app.use("/api/interviews", interviewRouter);
app.use("/api/ai-tests", aitestRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/chat", chatRouter);
app.use("/api/leaderboards", leaderboardRouter);
app.use("/api/certificates", certificateRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);
