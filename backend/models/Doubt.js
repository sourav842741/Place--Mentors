import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    question: { type: String, required: true, trim: true },
    aiAnswer: { type: String, default: "" },
    upvotes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    replyCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Doubt", doubtSchema);
