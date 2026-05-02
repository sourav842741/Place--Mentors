import { ApiError } from "../utils/ApiError.js";

const isAdmin = (req, res, next) => {
  const isPrivileged =
    req.user?.role === "admin" ||
    req.user?.role === "superadmin" ||
    req.user?.email === process.env.SUPER_ADMIN_EMAIL;

  if (!req.user || !isPrivileged) {
    throw new ApiError(403, "Admin access required");
  }
  next();
};

export default isAdmin;
