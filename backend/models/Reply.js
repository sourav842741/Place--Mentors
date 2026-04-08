import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  doubt: { type: mongoose.Schema.Types.ObjectId, ref: "Doubt" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  answer: String,

  // ✅ FIXED UPVOTE SYSTEM
 upvotes: {
  type: [mongoose.Schema.Types.ObjectId],
  ref: "User",
  default: [] // 🔥 ADD THIS
}

}, { timestamps: true });

export default mongoose.model("Reply", replySchema);