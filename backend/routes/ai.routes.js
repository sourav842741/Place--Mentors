import express from "express";
import {
  generateResumePDF,
  generateAIContent,
  generateYoutubeSummary,
  getMotivation,
} from "../controllers/ai.controller.js";
import { getYoutubeVideo } from "../services/youtube.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/generate-resume-pdf", isAuth, generateResumePDF);
router.post("/generate-content", isAuth, generateAIContent);
router.post("/youtube-summary", isAuth, generateYoutubeSummary);
router.get("/motivation", isAuth, getMotivation);

// New YouTube search endpoint - no auth required
router.get("/youtube", asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new ApiError(400, "Query parameter 'query' is required");
  }

  const videoData = await getYoutubeVideo(query);

  if (!videoData) {
    throw new ApiError(404, "No suitable video found");
  }

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      data: videoData
    })
  );
}));

export default router;
