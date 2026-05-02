import Settings from "../models/Settings.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Maintenance mode middleware
// Blocks non-admin users when maintenanceMode = true
const maintenanceCheck = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();

    if (settings?.maintenanceMode && settings.maintenanceAllowAdminAccess === false) {
      // Hard block all access
      return res.status(503).json(
        new ApiResponse(503, null, "Site under maintenance", {
          maintenance: true,
          title: settings.maintenanceTitle,
          message: settings.maintenanceMessage,
          image: settings.maintenanceImage,
        })
      );
    }

    if (settings?.maintenanceMode) {
      // Check if user is admin or superadmin (after auth middleware)
      const isAdmin =
        req.user &&
        (req.user.role === "admin" ||
          req.user.role === "superadmin" ||
          req.user.email === process.env.SUPER_ADMIN_EMAIL);
      if (!isAdmin) {
        return res.status(503).json(
          new ApiResponse(503, null, "Site under maintenance", {
            maintenance: true,
            title: settings.maintenanceTitle,
            message: settings.maintenanceMessage,
            image: settings.maintenanceImage,
          })
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default maintenanceCheck;
