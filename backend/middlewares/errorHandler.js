import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const errorHandler = (err, req, res, next) => {
  // Check for ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      new ApiResponse(err.statusCode, null, err.message, false)
    );
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json(
      new ApiResponse(400, null, 'File too large. Max 5MB allowed', false)
    );
  }

  // Generic error
  console.error('❌ Error:', err);
  res.status(500).json(
    new ApiResponse(500, null, 'Internal Server Error', false)
  );
};

export default errorHandler;
