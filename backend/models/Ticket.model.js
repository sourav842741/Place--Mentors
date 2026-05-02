import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: [
        "Login Issue",
        "Payment",
        "Premium",
        "Bug Report",
        "Resume",
        "Interview",
        "Account",
        "Other",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Solved", "Rejected"],
      default: "Open",
      index: true,
    },
    internalNote: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    isReopened: {
      type: Boolean,
      default: false,
    },
    reopenedAt: {
      type: Date,
      default: null,
    },
    solvedAt: {
      type: Date,
      default: null,
    },
    lastReplyAt: {
      type: Date,
      default: null,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    aiEscalated: {
      type: Boolean,
      default: false,
    },
    aiChatSummary: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Compound indexes for common admin queries
ticketSchema.index({ status: 1, priority: 1 });
ticketSchema.index({ category: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });

export default mongoose.model("Ticket", ticketSchema);
