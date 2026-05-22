import { ApiError } from "../utils/ApiError.js";

export function notFound(request, _response, next) {
  next(new ApiError(404, `Route ${request.method} ${request.originalUrl} was not found.`));
}

export function errorHandler(error, _request, response, _next) {
  const status = error.statusCode ?? (response.statusCode >= 400 ? response.statusCode : 500);

  response.status(status).json({
    success: false,
    message: error.message || "Unexpected server error.",
    ...(error.details ? { details: error.details } : {}),
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {})
  });
}

