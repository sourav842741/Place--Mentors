import { PlacementPrediction } from "../models/PlacementPrediction.model.js";
import { askAi, extractJSON } from "../services/openRouter.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  calculateManualScore,
  generateAIPrompt,
  sanitizeAIAnalysis,
} from "../utils/predictionScorer.js";

/* -------------------------------- */
/* PREDICT */
/* -------------------------------- */

export const predictPlacement = asyncHandler(async (req, res) => {
  const {
    collegeTier,
    cgpa,
    skillsLevel,
    dsaLevel,
    projectsCount,
    communicationLevel,
    internshipExperience,
  } = req.body;

  if (
    !collegeTier ||
    !cgpa ||
    !skillsLevel ||
    !dsaLevel ||
    !projectsCount ||
    !communicationLevel ||
    !internshipExperience
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (cgpa < 0 || cgpa > 10) {
    throw new ApiError(400, "CGPA must be between 0 to 10");
  }

  const inputs = req.body;

  const manualScore = calculateManualScore(inputs);

  let aiAnalysis = {
    weakAreas: [],
    personalizedSuggestions: "Focus on coding and projects.",
    thirtyDayPlan: "Daily coding practice.",
    bestCompanyFit: ["TCS", "Infosys", "Wipro"],
  };

  try {
    const messages = generateAIPrompt(inputs, manualScore);

    const response = await askAi(messages);

    const json = extractJSON(response);

    if (json) {
      aiAnalysis = json;
    }
  } catch (error) {
    console.log("AI Error:", error.message);
  }

  aiAnalysis = sanitizeAIAnalysis(aiAnalysis);

  const prediction = await PlacementPrediction.create({
    user: req.user._id,
    inputs,
    manualScore,
    aiAnalysis,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        prediction,
      },
      "Prediction generated successfully"
    )
  );
});

/* -------------------------------- */
/* HISTORY */
/* -------------------------------- */

export const getPredictionHistory = asyncHandler(async (req, res) => {
  const predictions = await PlacementPrediction.find({
    user: req.user._id,
  })
    .sort({
      createdAt: -1,
    })
    .limit(10);

  return res.status(200).json(new ApiResponse(200, predictions, "Prediction history fetched"));
});
