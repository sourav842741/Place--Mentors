import mongoose from "mongoose";

const ticketReplySchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fetching replies by ticket efficiently
ticketReplySchema.index({ ticket: 1, createdAt: 1 });

export default mongoose.model("TicketReply", ticketReplySchema);

