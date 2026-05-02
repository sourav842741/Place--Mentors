import mongoose from "mongoose";

const maintenanceQuestionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["hr", "aptitude", "coding", "vocab", "myth", "shortcut", "quote"],
      lowercase: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
maintenanceQuestionSchema.index({ type: 1, active: 1 });
maintenanceQuestionSchema.index({ active: 1 });

const MaintenanceQuestion =
  mongoose.models.MaintenanceQuestion ||
  mongoose.model("MaintenanceQuestion", maintenanceQuestionSchema);

export default MaintenanceQuestion;
