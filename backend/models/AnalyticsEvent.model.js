import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
      enum: [
        "quiz_started",
        "ai_interview_used",
        "resume_builder_used",
        "jobs_page_clicked",
        "placement_predictor_used",
        "premium_page_visit",
        "premium_button_click",
        "cookie_accept",
        "cookie_reject",
      ],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "tablet", "unknown"],
      default: "unknown",
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient aggregations
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ eventType: 1, createdAt: 1 });
analyticsEventSchema.index({ deviceType: 1, createdAt: -1 });

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

export default AnalyticsEvent;

