import Task from "../models/Task.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";

// ===============================
// Generate Unique Share ID
// ===============================
const generateShareId = () => {
  return crypto.randomBytes(16).toString("hex");
};

// ===============================
// CREATE TASK
// ===============================
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, category, priority, dueDate } = req.body;

  if (!title || !title.trim()) {
    throw new ApiError(400, "Task title is required");
  }

  if (!["Study", "Job", "Personal"].includes(category)) {
    throw new ApiError(400, "Invalid category");
  }

  if (!["Low", "Medium", "High"].includes(priority)) {
    throw new ApiError(400, "Invalid priority");
  }

  const task = await Task.create({
    userId: req.user._id,
    title: title.trim(),
    description: description?.trim() || "",
    category,
    priority,
    dueDate: dueDate ? new Date(dueDate) : null,
  });

  return res.status(201).json(
    new ApiResponse(201, task, "Task created successfully")
  );
});

// ===============================
// GET MY TASKS
// ===============================
export const getMyTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    userId: req.user._id,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, tasks, "Tasks fetched successfully")
  );
});

// ===============================
// GET SINGLE TASK
// ===============================
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res.status(200).json(
    new ApiResponse(200, task, "Task fetched successfully")
  );
});

// ===============================
// UPDATE TASK
// ===============================
export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, category, priority, dueDate } = req.body;

  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (title !== undefined) {
    if (!title.trim()) {
      throw new ApiError(400, "Task title is required");
    }
    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description.trim();
  }

  if (category !== undefined) {
    if (!["Study", "Job", "Personal"].includes(category)) {
      throw new ApiError(400, "Invalid category");
    }
    task.category = category;
  }

  if (priority !== undefined) {
    if (!["Low", "Medium", "High"].includes(priority)) {
      throw new ApiError(400, "Invalid priority");
    }
    task.priority = priority;
  }

  if (dueDate !== undefined) {
    task.dueDate = dueDate ? new Date(dueDate) : null;
  }

  await task.save();

  return res.status(200).json(
    new ApiResponse(200, task, "Task updated successfully")
  );
});

// ===============================
// DELETE TASK
// ===============================
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res.status(200).json(
    new ApiResponse(200, null, "Task deleted successfully")
  );
});

// ===============================
// TOGGLE COMPLETE
// ===============================
export const toggleTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  task.completed = !task.completed;

  await task.save();

  return res.status(200).json(
    new ApiResponse(200, task, "Task status updated")
  );
});

// ===============================
// SHARE TASK
// ===============================
export const shareTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  if (!task.shareId) {
    let unique = false;

    while (!unique) {
      const tempId = generateShareId();
      const exists = await Task.findOne({ shareId: tempId });

      if (!exists) {
        task.shareId = tempId;
        unique = true;
      }
    }
  }

  task.isShared = true;

  await task.save();

  return res.status(200).json(
    new ApiResponse(200, task, "Task shared successfully")
  );
});

// ===============================
// PUBLIC TASK
// ===============================
export const getPublicTask = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    shareId: req.params.shareId,
    isShared: true,
  });

  if (!task) {
    throw new ApiError(404, "Shared task not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        completed: task.completed,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
      },
      "Shared task fetched successfully"
    )
  );
});