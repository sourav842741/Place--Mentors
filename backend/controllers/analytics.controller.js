import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import AnalyticsEvent from "../models/AnalyticsEvent.model.js";

export const trackEvent = asyncHandler(async (req, res) => {
  const { eventType, metadata = {} } = req.body;

  if (!eventType) {
    return res.status(400).json(
      new ApiResponse(400, null, "eventType is required")
    );
  }

  // Detect device type from user-agent header
  const userAgent = req.headers["user-agent"] || "";
  let deviceType = "unknown";

  if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
    if (/ipad|tablet/i.test(userAgent)) {
      deviceType = "tablet";
    } else {
      deviceType = "mobile";
    }
  } else if (/tablet|ipad/i.test(userAgent)) {
    deviceType = "tablet";
  } else if (/windows|macintosh|linux/i.test(userAgent)) {
    deviceType = "desktop";
  }

  const event = await AnalyticsEvent.create({
    eventType,
    userId: req.user?._id || null,
    deviceType,
    metadata,
  });

  res.status(201).json(
    new ApiResponse(201, { tracked: true, eventId: event._id }, "Event tracked")
  );
});

