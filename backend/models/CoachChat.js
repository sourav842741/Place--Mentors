import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "ai"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const coachChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat",
    },
    messages: [messageSchema],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast history lookup
coachChatSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("CoachChat", coachChatSchema);
