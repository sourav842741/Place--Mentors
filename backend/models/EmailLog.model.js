import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // null for broadcast
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "daily_reminder",
        "streak_warning", 
        "comeback_email",
        "achievement_7d",
        "achievement_30d",
        "potd_alert",
        "coding_motivation",
        "placement_motivation",
        "resume_reminder",
        "interview_reminder",
        "feature_announcement",
        "custom_broadcast",
      ],
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "opened", "bounced"],
      default: "pending",
    },
    responseId: {
      type: String, // Resend ID
    },
    sentAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // Resend metadata
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes for queries
emailLogSchema.index({ userId: 1, type: 1 });
emailLogSchema.index({ status: 1, createdAt: -1 });
emailLogSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model("EmailLog", emailLogSchema);
