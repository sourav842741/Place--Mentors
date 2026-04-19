import Settings from "../models/Settings.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Maintenance mode middleware
// Blocks non-admin users when maintenanceMode = true
const maintenanceCheck = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    
    if (settings?.maintenanceMode && 
        settings.maintenanceAllowAdminAccess === false) {
      // Hard block all access
      return res.status(503).json(
        new ApiResponse(503, null, "Site under maintenance", {
          maintenance: true,
          title: settings.maintenanceTitle,
          message: settings.maintenanceMessage,
          image: settings.maintenanceImage
        })
      );
    }

    if (settings?.maintenanceMode) {
      // Check if user is admin (after auth middleware)
      if (!req.user || req.user.role !== "admin") {
        return res.status(503).json(
          new ApiResponse(503, null, "Site under maintenance", {
            maintenance: true,
            title: settings.maintenanceTitle,
            message: settings.maintenanceMessage,
            image: settings.maintenanceImage
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

