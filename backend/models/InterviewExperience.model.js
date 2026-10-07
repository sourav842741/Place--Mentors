import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  roundName: { type: String, required: true }, // e.g. "Round 1: Online Assessment"
  duration: { type: String, default: "60 mins" },
  description: { type: String, required: true },
  questions: [{ type: String }],
});

const interviewExperienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    candidateName: { type: String, default: "Anonymous Student" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    driveType: {
      type: String,
      enum: ["On-Campus", "Off-Campus", "Referral", "Hackathon", "Internship"],
      default: "On-Campus",
    },
    outcome: {
      type: String,
      enum: ["Offer Received", "Accepted", "Rejected", "Pending"],
      default: "Offer Received",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    ctc: { type: String, default: "" }, // e.g. "24 LPA"
    year: { type: Number, default: 2026 },
    rounds: [roundSchema],
    keyTopics: [{ type: String }],
    advice: { type: String, default: "" },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

interviewExperienceSchema.index({ company: 1, role: 1 });
interviewExperienceSchema.index({ createdAt: -1 });

export default mongoose.model("InterviewExperience", interviewExperienceSchema);
