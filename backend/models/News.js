import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
    },
    tag: {
      type: String,
      enum: ["AI", "Layoff", "Hiring", "Tech"],
      required: true,
    },
    company: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    publishedAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ tag: 1 });

export default mongoose.model("News", newsSchema);
