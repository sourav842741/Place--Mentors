import { PlacementPrediction } from "../models/PlacementPrediction.model.js";
import { askAi, extractJSON } from "../services/openRouter.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/* -------------------------------- */
/* REALISTIC SCORE ENGINE */
/* -------------------------------- */

const calculateManualScore = (inputs) => {
  const scores = {
    cgpa: Number(inputs.cgpa),

    skills: {
      Beginner: 3,
      Intermediate: 6,
      Strong: 9,
    }[inputs.skillsLevel],

    dsa: {
      Weak: 2,
      Average: 5,
      Good: 8,
    }[inputs.dsaLevel],

    projects: {
      "0": 1,
      "1-2": 5,
      "3+": 8,
    }[inputs.projectsCount],

    communication: {
      Weak: 2,
      Average: 5,
      Good: 8,
    }[inputs.communicationLevel],

    internship:
      inputs.internshipExperience === "Yes"
        ? 8
        : 2,
  };

  let rawScore =
    scores.cgpa * 0.28 +
    scores.skills * 0.22 +
    scores.dsa * 0.2 +
    scores.projects * 0.12 +
    scores.communication * 0.1 +
    scores.internship * 0.08;

  const tierBonus = {
    "Tier 1": 8,
    "Tier 2": 3,
    "Tier 3": -4,
  }[inputs.collegeTier];

  const placementChance = Math.max(
    15,
    Math.min(
      98,
      Math.round(rawScore * 10 + tierBonus)
    )
  );

  const readinessScore = Math.round(
    ((scores.skills +
      scores.dsa +
      scores.projects +
      scores.communication) /
      4) *
      10
  );

  let min = 0;
  let max = 0;

  if (inputs.collegeTier === "Tier 1") {
    if (placementChance >= 85) {
      min = 12;
      max = 28;
    } else if (placementChance >= 70) {
      min = 8;
      max = 18;
    } else if (placementChance >= 55) {
      min = 6;
      max = 12;
    } else {
      min = 4;
      max = 8;
    }
  }

  if (inputs.collegeTier === "Tier 2") {
    if (placementChance >= 85) {
      min = 8;
      max = 16;
    } else if (placementChance >= 70) {
      min = 6;
      max = 12;
    } else if (placementChance >= 55) {
      min = 4.5;
      max = 8;
    } else {
      min = 3;
      max = 6;
    }
  }

  if (inputs.collegeTier === "Tier 3") {
    if (placementChance >= 85) {
      min = 6;
      max = 12;
    } else if (placementChance >= 70) {
      min = 4.5;
      max = 8;
    } else if (placementChance >= 55) {
      min = 3.5;
      max = 6;
    } else {
      min = 2.5;
      max = 5;
    }
  }

  return {
    placementChance,
    readinessScore,
    expectedSalaryRange: `₹${min}-${max} LPA`,
  };
};

/* -------------------------------- */
/* AI PROMPT */
/* -------------------------------- */

const generateAIPrompt = (
  inputs,
  manualScore
) => [
  {
    role: "system",
    content: `
You are an expert placement mentor for Indian students.

Return ONLY valid JSON:

{
 "weakAreas":[""],
 "personalizedSuggestions":"bullet points",
 "thirtyDayPlan":"30 day roadmap",
 "bestCompanyFit":[""]
}

Profile: ${JSON.stringify(inputs)}

Placement Chance: ${
      manualScore.placementChance
    }%

Salary Range: ${
      manualScore.expectedSalaryRange
    }

Give realistic fresher advice.
`,
  },
  {
    role: "user",
    content: "Return JSON only",
  },
];

/* -------------------------------- */
/* AI DATA CLEANER */
/* -------------------------------- */

const sanitizeAIAnalysis = (
  aiAnalysis = {}
) => {
  if (
    Array.isArray(
      aiAnalysis.personalizedSuggestions
    )
  ) {
    aiAnalysis.personalizedSuggestions =
      aiAnalysis.personalizedSuggestions
        .map(
          (item, index) =>
            `${index + 1}. ${item}`
        )
        .join("\n");
  }

  if (
    typeof aiAnalysis
      .personalizedSuggestions ===
      "object" &&
    !Array.isArray(
      aiAnalysis.personalizedSuggestions
    ) &&
    aiAnalysis.personalizedSuggestions !==
      null
  ) {
    aiAnalysis.personalizedSuggestions =
      Object.values(
        aiAnalysis
          .personalizedSuggestions
      ).join("\n");
  }

  if (
    typeof aiAnalysis.thirtyDayPlan ===
      "object" &&
    !Array.isArray(
      aiAnalysis.thirtyDayPlan
    ) &&
    aiAnalysis.thirtyDayPlan !== null
  ) {
    aiAnalysis.thirtyDayPlan =
      Object.entries(
        aiAnalysis.thirtyDayPlan
      )
        .map(
          ([key, value]) =>
            `${key}: ${value}`
        )
        .join("\n");
  }

  if (
    Array.isArray(aiAnalysis.thirtyDayPlan)
  ) {
    aiAnalysis.thirtyDayPlan =
      aiAnalysis.thirtyDayPlan.join(
        "\n"
      );
  }

  if (
    !Array.isArray(aiAnalysis.weakAreas)
  ) {
    aiAnalysis.weakAreas =
      aiAnalysis.weakAreas
        ? [String(aiAnalysis.weakAreas)]
        : [];
  }

  if (
    !Array.isArray(
      aiAnalysis.bestCompanyFit
    )
  ) {
    aiAnalysis.bestCompanyFit =
      aiAnalysis.bestCompanyFit
        ? [
            String(
              aiAnalysis.bestCompanyFit
            ),
          ]
        : [];
  }

  if (
    !aiAnalysis.personalizedSuggestions
  ) {
    aiAnalysis.personalizedSuggestions =
      "Focus on coding, projects, resume and communication.";
  }

  if (!aiAnalysis.thirtyDayPlan) {
    aiAnalysis.thirtyDayPlan =
      "Daily DSA + aptitude + resume + mock interview practice.";
  }

  return aiAnalysis;
};

/* -------------------------------- */
/* PREDICT */
/* -------------------------------- */

export const predictPlacement =
  asyncHandler(async (req, res) => {
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
      throw new ApiError(
        400,
        "All fields are required"
      );
    }

    if (cgpa < 0 || cgpa > 10) {
      throw new ApiError(
        400,
        "CGPA must be between 0 to 10"
      );
    }

    const inputs = req.body;

    const manualScore =
      calculateManualScore(inputs);

    let aiAnalysis = {
      weakAreas: [],
      personalizedSuggestions:
        "Focus on coding and projects.",
      thirtyDayPlan:
        "Daily coding practice.",
      bestCompanyFit: [
        "TCS",
        "Infosys",
        "Wipro",
      ],
    };

    try {
      const messages = generateAIPrompt(
        inputs,
        manualScore
      );

      const response = await askAi(
        messages
      );

      const json =
        extractJSON(response);

      if (json) {
        aiAnalysis = json;
      }
    } catch (error) {
      console.log(
        "AI Error:",
        error.message
      );
    }

    aiAnalysis =
      sanitizeAIAnalysis(
        aiAnalysis
      );

    const prediction =
      await PlacementPrediction.create({
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

export const getPredictionHistory =
  asyncHandler(async (req, res) => {
    const predictions =
      await PlacementPrediction.find({
        user: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .limit(10);

    return res.status(200).json(
      new ApiResponse(
        200,
        predictions,
        "Prediction history fetched"
      )
    );
  });