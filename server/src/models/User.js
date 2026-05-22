import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ROLES } from "../config/constants.js";

const refreshTokenSchema = new mongoose.Schema(
  {
    hash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    userAgent: String,
    ip: String
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, select: false },
    role: { type: String, enum: ROLES, default: "student", index: true },
    avatar: String,
    googleId: { type: String, index: true, sparse: true },
    githubId: { type: String, index: true, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: Date,
    refreshTokens: { type: [refreshTokenSchema], select: false, default: [] },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    pendingTwoFactorSecret: { type: String, select: false },
    lastLogin: Date,
    isActive: { type: Boolean, default: true, index: true }
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password ?? "");
};

userSchema.methods.generateAccessToken = function generateAccessToken() {
  return jwt.sign({ role: this.role }, env.jwtAccessSecret, {
    subject: this.id,
    expiresIn: env.jwtAccessExpire
  });
};

userSchema.methods.generateRefreshToken = function generateRefreshToken() {
  return jwt.sign({ type: "refresh" }, env.jwtRefreshSecret, {
    subject: this.id,
    expiresIn: env.jwtRefreshExpire
  });
};

userSchema.methods.generateEmailVerificationToken = function generateEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  return token;
};

userSchema.methods.generatePasswordResetToken = function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
  return token;
};

userSchema.set("toJSON", {
  transform(_document, value) {
    delete value.password;
    delete value.refreshTokens;
    delete value.twoFactorSecret;
    delete value.pendingTwoFactorSecret;
    delete value.emailVerificationToken;
    delete value.passwordResetToken;
    return value;
  }
});

export const User = mongoose.model("User", userSchema);

