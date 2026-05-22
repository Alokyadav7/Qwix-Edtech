import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/user.model.js";

export async function requireAuth(request, response, next) {
  const authorization = request.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    response.status(401);
    return next(new Error("Authentication token is required."));
  }

  try {
    const token = authorization.slice("Bearer ".length);
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub);

    if (!user) {
      response.status(401);
      return next(new Error("Account no longer exists."));
    }

    request.user = user;
    return next();
  } catch (_error) {
    response.status(401);
    return next(new Error("Authentication token is invalid or expired."));
  }
}

export function allowRoles(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      response.status(403);
      return next(new Error("You do not have access to this resource."));
    }

    return next();
  };
}

