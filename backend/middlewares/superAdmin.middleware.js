import { ApiError } from "../utils/ApiError.js";

const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
    throw new ApiError(403, "Super Admin access required");
  }
  next();
};

export default isSuperAdmin;

