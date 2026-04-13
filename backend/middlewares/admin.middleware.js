import { ApiError } from "../utils/ApiError.js";

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Admin access required");
  }
  next();
};

export default isAdmin;

