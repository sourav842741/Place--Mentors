import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  testCases: [testCaseSchema],
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
});

const battleSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    problem: {
      type: problemSchema,
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["running", "finished", "draw"],
      default: "running",
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    language: String,
  },
  { timestamps: true }
);

export default mongoose.model("Battle", battleSchema);
