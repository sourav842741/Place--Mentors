import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: String,
  expectedOutput: String,
  isSample: { type: Boolean, default: false }
});

const codingQuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  inputFormat: {
    type: String,
    required: true
  },
  outputFormat: {
    type: String,
    required: true
  },
  constraints: {
    type: String,
    required: true
  },
  sampleTestCases: [testCaseSchema],
  hiddenTestCases: [testCaseSchema],
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true
  },
  solutionExplanation: {
    type: String
  }
});

const cpotdSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
    unique: true
  },
  questions: [codingQuestionSchema],
  generatedAt: {
    type: Date,
    default: Date.now,
    expires: 25 * 60 * 60,
  }
}, { timestamps: true });

export default mongoose.model("CodingPotd", cpotdSchema);
