import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_request, file, callback) {
    if (!file.mimetype.match(/^(image\/|application\/pdf|video\/)/)) {
      return callback(new ApiError(415, "Unsupported upload type."));
    }
    return callback(null, true);
  }
});

