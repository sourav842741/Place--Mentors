import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badgeName: {
      type: String,
      required: true,
      index: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      badgeIcon: String,
      earnedAt: Date,
      levelXP: Number,
      streakCount: Number,
      // Frontend gen data
      templateType: {
        type: String,
        enum: ["png", "pdf"],
        default: "png",
      },
    },
  },
  { timestamps: true }
);

// Compound index for duplicate prevention
certificateSchema.index({ userId: 1, badgeName: 1 }, { unique: true });

// Method to generate ID
certificateSchema.statics.generateId = function () {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000).toString();
  return `PM-${year}-${random}`;
};

export default mongoose.model("Certificate", certificateSchema);

