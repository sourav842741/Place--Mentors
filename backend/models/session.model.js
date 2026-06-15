import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Random/unique per login. Used in JWT + DB validation.
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    browser: { type: String, default: "" },
    os: { type: String, default: "" },
    deviceName: { type: String, default: "" },

    ipAddress: { type: String, default: "" },

    location: {
      city: { type: String, default: "" },
      region: { type: String, default: "" },
      country: { type: String, default: "" },
    },

    loginTime: { type: Date, required: true },
    lastActive: { type: Date, required: true },


    // Derived from sessionId in practice, but kept for UI + quick filtering.
    isCurrent: { type: Boolean, default: false, index: true },

    // One-time notification per session
    emailSentAt: { type: Date, default: null },

    // Login method for future login history / analytics
    loginMethod: {
      type: String,
      enum: ["email", "google"],
      default: "email",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Session", sessionSchema);
