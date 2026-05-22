import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

async function loadUserFromToken(token) {
  const payload = jwt.verify(token, env.jwtAccessSecret);
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new ApiError(401, "Account is unavailable.");
  }
  return user;
}

export async function verifyAccessToken(request, _response, next) {
  try {
    const header = request.get("authorization");
    if (!header?.startsWith("Bearer ")) {
      throw new ApiError(401, "Access token is required.");
    }
    request.user = await loadUserFromToken(header.slice("Bearer ".length));
    return next();
  } catch (error) {
    return next(error.statusCode ? error : new ApiError(401, "Access token is invalid or expired."));
  }
}

export async function optionalAuth(request, _response, next) {
  const header = request.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return next();
  }

  try {
    request.user = await loadUserFromToken(header.slice("Bearer ".length));
  } catch (_error) {
    request.user = undefined;
  }
  return next();
}

