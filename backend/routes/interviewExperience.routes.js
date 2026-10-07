import express from "express";
import {
  getAllExperiences,
  getExperienceById,
  createExperience,
  toggleUpvoteExperience,
} from "../controllers/interviewExperience.controller.js";
import isAuth from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = express.Router();

// Publicly readable
router.get("/", maintenanceCheck, getAllExperiences);
router.get("/:id", maintenanceCheck, getExperienceById);

// Protected or public submissions
router.post("/", maintenanceCheck, isAuth, createExperience);
router.post("/:id/upvote", maintenanceCheck, toggleUpvoteExperience);

export default router;
