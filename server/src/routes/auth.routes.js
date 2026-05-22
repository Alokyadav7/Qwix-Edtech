import { body } from "express-validator";
import { Router } from "express";
import { passport } from "../config/passport.js";
import * as auth from "../controllers/auth.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { optionalAuth, verifyAccessToken } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

export const authRouter = Router();

const registrationValidation = [
  body("name").trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("role").isIn(["student", "company", "college"]),
  validate
];

authRouter.post("/register", authLimiter, registrationValidation, asyncHandler(auth.register));
authRouter.post("/verify-email", body("token").notEmpty(), validate, asyncHandler(auth.verifyEmail));
authRouter.post("/login", authLimiter, body("email").isEmail(), body("password").notEmpty(), validate, asyncHandler(auth.login));
authRouter.post("/verify-2fa", body("email").isEmail(), body("token").notEmpty(), validate, asyncHandler(auth.verifyTwoFactor));
authRouter.post("/refresh-token", asyncHandler(auth.refreshToken));
authRouter.post("/logout", optionalAuth, asyncHandler(auth.logout));
authRouter.post("/forgot-password", authLimiter, body("email").isEmail(), validate, asyncHandler(auth.forgotPassword));
authRouter.post("/reset-password", body("token").notEmpty(), body("newPassword").isLength({ min: 8 }), validate, asyncHandler(auth.resetPassword));
authRouter.post("/setup-2fa", verifyAccessToken, asyncHandler(auth.setupTwoFactor));
authRouter.post("/enable-2fa", verifyAccessToken, body("token").notEmpty(), validate, asyncHandler(auth.enableTwoFactor));
authRouter.get("/me", verifyAccessToken, asyncHandler(auth.me));

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
authRouter.get("/google/callback", passport.authenticate("google", { session: false }), asyncHandler(auth.oauthCallback));
authRouter.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
authRouter.get("/github/callback", passport.authenticate("github", { session: false }), asyncHandler(auth.oauthCallback));

