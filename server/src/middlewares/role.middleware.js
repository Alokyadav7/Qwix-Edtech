import { ApiError } from "../utils/ApiError.js";

export function requireRole(...roles) {
  return (request, _response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return next(new ApiError(403, "You do not have permission for this action."));
    }
    return next();
  };
}

