import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (options) {
        return Array.isArray(options) && options.length === 4;
      },
      message: "Must have exactly 4 options",
    },
  },
  answer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["aptitude", "reasoning", "verbal"],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: true,
  },
});

const potdSchema = new mongoose.Schema(
  {
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      unique: true,
    },
    questions: [questionSchema],
    isManual: {
      type: Boolean,
      default: false
    },
    generatedAt: {
      type: Date,
      default: Date.now,
      expires: 25 * 60 * 60,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Potd", potdSchema);
