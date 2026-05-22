import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import QRCode from "qrcode";
import speakeasy from "speakeasy";
import { env } from "../config/env.js";
import { queueEmail } from "../jobs/email.job.js";
import { College } from "../models/College.js";
import { Company } from "../models/Company.js";
import { Student } from "../models/Student.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { safePublicUser } from "../utils/helpers.js";

function digest(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: env.nodeEnv === "production" ? "none" : "lax",
    secure: env.nodeEnv === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

async function issueTokens(user, request, response) {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshTokens.push({
    hash: digest(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: request.get("user-agent"),
    ip: request.ip
  });
  user.lastLogin = new Date();
  await user.save();
  response.cookie(env.refreshCookieName, refreshToken, cookieOptions());
  return { accessToken, refreshToken };
}

export async function register(request, response) {
  const { name, email, password, role } = request.body;
  if (await User.exists({ email: email.toLowerCase() })) {
    throw new ApiError(409, "Email is already registered.");
  }

  const session = await mongoose.startSession();
  let token;
  let user;
  await session.withTransaction(async () => {
    [user] = await User.create([{ name, email, password, role }], { session });
    if (role === "student") await Student.create([{ user: user.id }], { session });
    if (role === "company") await Company.create([{ user: user.id, companyName: request.body.companyName ?? name }], { session });
    if (role === "college") await College.create([{ user: user.id, collegeName: request.body.collegeName ?? name }], { session });
    token = user.generateEmailVerificationToken();
    await user.save({ session });
  });
  await session.endSession();

  const verificationUrl = `${env.frontendUrl}/verify-email?token=${token}`;
  await queueEmail({
    to: user.email,
    subject: "Verify your Student Platform email",
    text: `Verify your email: ${verificationUrl}`,
    html: `<p>Verify your email to activate your account.</p><p><a href="${verificationUrl}">Verify email</a></p>`
  });
  response.status(201).json({ success: true, message: "Registration created. Verify your email to continue." });
}

export async function verifyEmail(request, response) {
  const user = await User.findOne({ emailVerificationToken: digest(request.body.token) }).select("+emailVerificationToken +refreshTokens");
  if (!user) throw new ApiError(400, "Verification token is invalid.");
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  const tokens = await issueTokens(user, request, response);
  response.json({ success: true, data: { user: safePublicUser(user), ...tokens } });
}

export async function login(request, response) {
  const user = await User.findOne({ email: request.body.email.toLowerCase() }).select("+password +refreshTokens +twoFactorSecret");
  if (!user || !(await user.comparePassword(request.body.password))) {
    throw new ApiError(401, "Email or password is incorrect.");
  }
  if (!user.isEmailVerified) throw new ApiError(403, "Verify your email before login.");
  if (!user.isActive) throw new ApiError(403, "Account is disabled.");
  if (user.twoFactorEnabled) {
    return response.json({ success: true, data: { twofa_required: true, email: user.email } });
  }
  const tokens = await issueTokens(user, request, response);
  return response.json({ success: true, data: { user: safePublicUser(user), ...tokens } });
}

export async function verifyTwoFactor(request, response) {
  const user = await User.findOne({ email: request.body.email.toLowerCase() }).select("+twoFactorSecret +refreshTokens");
  const verified = user && speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: request.body.token,
    window: 1
  });
  if (!verified) throw new ApiError(401, "Two-factor token is invalid.");
  const tokens = await issueTokens(user, request, response);
  response.json({ success: true, data: { user: safePublicUser(user), ...tokens } });
}

export async function refreshToken(request, response) {
  const refreshTokenValue = request.cookies[env.refreshCookieName] ?? request.body.refreshToken;
  if (!refreshTokenValue) throw new ApiError(401, "Refresh token is required.");
  let payload;
  try {
    payload = jwt.verify(refreshTokenValue, env.jwtRefreshSecret);
  } catch (_error) {
    throw new ApiError(401, "Refresh token is invalid or expired.");
  }

  const user = await User.findById(payload.sub).select("+refreshTokens");
  const tokenHash = digest(refreshTokenValue);
  if (!user || !user.refreshTokens.some((token) => token.hash === tokenHash)) {
    throw new ApiError(401, "Refresh token was rotated or revoked.");
  }
  user.refreshTokens = user.refreshTokens.filter((token) => token.hash !== tokenHash);
  const tokens = await issueTokens(user, request, response);
  response.json({ success: true, data: tokens });
}

export async function logout(request, response) {
  const refreshTokenValue = request.cookies[env.refreshCookieName] ?? request.body.refreshToken;
  if (refreshTokenValue && request.user) {
    const user = await User.findById(request.user.id).select("+refreshTokens");
    user.refreshTokens = user.refreshTokens.filter((token) => token.hash !== digest(refreshTokenValue));
    await user.save();
  }
  response.clearCookie(env.refreshCookieName, cookieOptions());
  response.json({ success: true, message: "Logged out." });
}

export async function forgotPassword(request, response) {
  const user = await User.findOne({ email: request.body.email.toLowerCase() }).select("+passwordResetToken");
  if (user) {
    const token = user.generatePasswordResetToken();
    await user.save();
    const resetUrl = `${env.frontendUrl}/reset-password?token=${token}`;
    await queueEmail({
      to: user.email,
      subject: "Reset your Student Platform password",
      text: resetUrl,
      html: `<p><a href="${resetUrl}">Reset password</a></p>`
    });
  }
  response.json({ success: true, message: "If the account exists, a reset email has been sent." });
}

export async function resetPassword(request, response) {
  const user = await User.findOne({
    passwordResetToken: digest(request.body.token),
    passwordResetExpiry: { $gt: new Date() }
  }).select("+passwordResetToken +refreshTokens");
  if (!user) throw new ApiError(400, "Reset token is invalid or expired.");
  user.password = request.body.newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  user.refreshTokens = [];
  await user.save();
  response.clearCookie(env.refreshCookieName, cookieOptions());
  response.json({ success: true, message: "Password updated." });
}

export async function setupTwoFactor(request, response) {
  const secret = speakeasy.generateSecret({ name: `Student Platform (${request.user.email})` });
  const user = await User.findById(request.user.id).select("+pendingTwoFactorSecret");
  user.pendingTwoFactorSecret = secret.base32;
  await user.save();
  response.json({ success: true, data: { qrCodeUrl: await QRCode.toDataURL(secret.otpauth_url), manualKey: secret.base32 } });
}

export async function enableTwoFactor(request, response) {
  const user = await User.findById(request.user.id).select("+pendingTwoFactorSecret +twoFactorSecret");
  const verified = speakeasy.totp.verify({
    secret: user.pendingTwoFactorSecret,
    encoding: "base32",
    token: request.body.token,
    window: 1
  });
  if (!verified) throw new ApiError(422, "Two-factor confirmation code is invalid.");
  user.twoFactorSecret = user.pendingTwoFactorSecret;
  user.pendingTwoFactorSecret = undefined;
  user.twoFactorEnabled = true;
  await user.save();
  response.json({ success: true, message: "Two-factor authentication enabled." });
}

export async function oauthCallback(request, response) {
  const tokens = await issueTokens(request.user, request, response);
  response.redirect(`${env.frontendUrl}/oauth/callback?accessToken=${tokens.accessToken}`);
}

export async function me(request, response) {
  response.json({ success: true, data: { user: safePublicUser(request.user) } });
}

