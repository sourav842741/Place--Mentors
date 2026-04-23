import { ApiError } from "../utils/ApiError.js";

const isSuperAdmin = (req, res, next) => {
  const isSuper =
    req.user?.role === "superadmin" ||
    req.user?.email === process.env.SUPER_ADMIN_EMAIL;

  if (!req.user || !isSuper) {
    throw new ApiError(403, "Super Admin access required");
  }
  next();
};

export default isSuperAdmin;

