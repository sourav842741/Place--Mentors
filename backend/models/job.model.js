import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: "INR",
      },
      text: {
        type: String,
        default: "Not disclosed",
      },
    },

    description: {
      type: String,
      trim: true,
    },

    applyLink: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // prevents duplicate null issues
    },

    source: {
      type: String,
      enum: ["Adzuna", "LinkedIn", "Indeed"],
      default: "Adzuna",
      index: true,
    },

    postedDate: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      default: () =>
        new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
  }
);

/* ================================
   INDEXES
================================ */

// Latest jobs
jobSchema.index({ postedDate: -1 });

// TTL (auto delete after expiry)
jobSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Full-text search
jobSchema.index({
  title: "text",
  description: "text",
  company: "text",
});

// Optional compound index for filtering
jobSchema.index({ location: 1, postedDate: -1 });

export default mongoose.model("Job", jobSchema);