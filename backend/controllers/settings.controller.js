import Settings from "../models/Settings.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get site settings (Admin only)
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    // Create default settings if none exists
    settings = new Settings({
      maintenanceMode: false,
      maintenanceTitle: "Under Maintenance",
      maintenanceMessage: "We're working on improvements. Back soon! 🚀",
      maintenanceAllowAdminAccess: true,
      announcementEnabled: false,
      announcementType: "info",
      announcementClosable: true,
    });
    await settings.save();
  }

  res.status(200).json(new ApiResponse(200, settings, "Settings fetched successfully"));
});

// @desc    Update site settings (Admin only)
export const updateSettings = asyncHandler(async (req, res) => {
  const updates = req.body;

  // Validate required fields for maintenance/announcement
  if (updates.maintenanceMode !== undefined && typeof updates.maintenanceMode !== "boolean") {
    throw new ApiError(400, "maintenanceMode must be boolean");
  }

  if (
    updates.announcementEnabled !== undefined &&
    typeof updates.announcementEnabled !== "boolean"
  ) {
    throw new ApiError(400, "announcementEnabled must be boolean");
  }

  if (
    updates.announcementType &&
    !["info", "warning", "success", "danger"].includes(updates.announcementType)
  ) {
    throw new ApiError(400, "Invalid announcementType");
  }

  let settings = await Settings.findOne();

  if (!settings) {
    settings = new Settings(updates);
  } else {
    // Update existing
    Object.keys(updates).forEach((key) => {
      settings[key] = updates[key];
    });
  }

  await settings.save();

  /* =========================
     REAL-TIME BROADCAST
  ========================= */
  if (req.io) {
    req.io.emit("maintenance_updated", {
      maintenanceMode: settings.maintenanceMode,
      maintenanceTitle: settings.maintenanceTitle,
      maintenanceMessage: settings.maintenanceMessage,
      maintenanceImage: settings.maintenanceImage,
      maintenanceAllowAdminAccess: settings.maintenanceAllowAdminAccess,
      updatedAt: settings.updatedAt,
    });
  }

  res.status(200).json(new ApiResponse(200, settings, "Settings updated successfully"));
});

export const getPublicSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();

  if (!settings) {
    settings = await Settings.create({
      maintenanceMode: false,
      maintenanceTitle: "Under Maintenance",
      maintenanceMessage: "We're working on improvements. Back soon! 🚀",
      maintenanceAllowAdminAccess: true,

      announcementEnabled: false,
      announcementText: "",
      announcementImage: "",
      announcementType: "info",
      announcementClosable: true,
      announcementButtonText: "",
      announcementButtonLink: "",
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        maintenanceMode: settings.maintenanceMode,
        maintenanceTitle: settings.maintenanceTitle,
        maintenanceMessage: settings.maintenanceMessage,
        maintenanceImage: settings.maintenanceImage,

        announcementEnabled: settings.announcementEnabled,
        announcementText: settings.announcementText,
        announcementImage: settings.announcementImage,
        announcementType: settings.announcementType,
        announcementClosable: settings.announcementClosable,
        announcementButtonText: settings.announcementButtonText,
        announcementButtonLink: settings.announcementButtonLink,
      },
      "Public settings fetched successfully"
    )
  );
});
