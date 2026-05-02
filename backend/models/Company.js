import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    overview: {
      name: { type: String, required: true },
      tagline: String,
      description: String,
      industry: String,
      headquarters: String,
    },
    hiring: {
      pattern: [
        {
          round: String,
          details: String,
        },
      ],
      difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium",
      },
      importantPoints: [String],
    },
    salary: {
      average: String,
      intern: String,
      bonus: String,
    },
    examTimeline: {
      expected: String,
      lastYear: String,
      note: String,
    },
    preparation: {
      roadmap: String,
      topics: {
        mustDo: [String],
        aptitude: {
          quantitative: [String],
          logical: [String],
          verbal: [String],
        },
        coreSubjects: {
          os: [String],
          dbms: [String],
          oops: [String],
        },
        advanced: {
          systemDesign: [String],
          csConcepts: [String],
        },
      },
      dailyPlanGuide: String,
    },
    resources: {
      youtube: [
        {
          title: String,
          link: String,
        },
      ],
      coding: [
        {
          platform: String,
          link: String,
        },
      ],
      aptitude: [
        {
          platform: String,
          link: String,
        },
      ],
    },
    cutoff: {
      coding: String,
      aptitude: String,
      note: String,
    },
    strategy: {
      finalTips: [String],
      mistakesToAvoid: [String],
    },
    aiFeatures: {
      resumeTips: String,
      interviewQuestions: [String],
      aiPromptSuggestion: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
