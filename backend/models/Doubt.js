import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  question: String,
  aiAnswer: String,
  upvotes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    default: []
  }
}, { timestamps: true });

export default mongoose.model("Doubt", doubtSchema);