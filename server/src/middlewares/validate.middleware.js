import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export function validate(request, _response, next) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return next(new ApiError(422, "Validation failed.", errors.array()));
  }
  return next();
}

