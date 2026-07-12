import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { fetchAndProcessNews } from "../services/news.service.js";

// Admin manual trigger: fetch & process latest news immediately
export const adminFetchNews = asyncHandler(async (req, res) => {
  const processed = await fetchAndProcessNews();

  // fetchAndProcessNews() returns number; treat 0 as still-successful (no new items)
  if (typeof processed !== "number") {
    throw new ApiError(500, "News processing failed");
  }

  return res.status(200).json({
    success: true,
    message: "Latest news fetched successfully",
    processed,
  });
});

