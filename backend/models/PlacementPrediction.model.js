import mongoose from "mongoose";

const placementPredictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    inputs: {
      collegeTier: {
        type: String,
        enum: ["Tier 1", "Tier 2", "Tier 3"],
        required: true,
      },

      cgpa: {
        type: Number,
        min: 0,
        max: 10,
        required: true,
      },

      skillsLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Strong"],
        required: true,
      },

      dsaLevel: {
        type: String,
        enum: ["Weak", "Average", "Good"],
        required: true,
      },

      projectsCount: {
        type: String,
        enum: ["0", "1-2", "3+"],
        required: true,
      },

      communicationLevel: {
        type: String,
        enum: ["Weak", "Average", "Good"],
        required: true,
      },

      internshipExperience: {
        type: String,
        enum: ["No", "Yes"],
        required: true,
      },
    },

    manualScore: {
      placementChance: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      readinessScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      expectedSalaryRange: {
        type: String,
        default: "",
      },
    },

    aiAnalysis: {
      weakAreas: {
        type: [String],
        default: [],
      },

      personalizedSuggestions: {
        type: String,
        default: "",
      },

      thirtyDayPlan: {
        type: String,
        default: "",
      },

      bestCompanyFit: {
        type: [String],
        default: [],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const PlacementPrediction = mongoose.model("PlacementPrediction", placementPredictionSchema);
