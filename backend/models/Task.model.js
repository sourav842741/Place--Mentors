import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: {
        values: ["Study", "Job", "Personal"],
        message: "Category must be Study, Job, or Personal",
      },
      required: true,
    },
    priority: {
      type: String,
      enum: {
        values: ["Low", "Medium", "High"],
        message: "Priority must be Low, Medium, or High",
      },
      default: "Medium",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    isShared: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
taskSchema.index({ userId: 1, completed: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });

export default mongoose.model("Task", taskSchema);
