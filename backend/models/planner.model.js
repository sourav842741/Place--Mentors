// models/planner.model.js

import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: String,
  type: String, // coding | video | theory | quiz
  time: String,
  difficulty: String,
  platform: String,
  link: String,
  youtubeQuery: String,
  videoUrl: String,
  completed: { type: Boolean, default: false },
});

const daySchema = new mongoose.Schema({
  day: Number,
  title: String,
  tasks: [taskSchema],
});

const plannerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    goal: String,
    company: String,
    daysLeft: Number,
    dailyHours: Number,
    level: String,
    currentDay: { type: Number, default: 1 },
    progress: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 },
    syncedToCalendar: { type: Date },

    plan: [daySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Planner", plannerSchema);
