import { ApiError } from "../utils/ApiError.js";

const isAdmin = (req, res, next) => {
if (!req.user || (req.user.role !== "admin" && req.user.email !== process.env.SUPER_ADMIN_EMAIL)) {
    throw new ApiError(403, "Admin access required");
  }
  next();
};

export default isAdmin;

