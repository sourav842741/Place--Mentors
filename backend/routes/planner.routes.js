// routes/planner.routes.js

import express from "express";
import {
  createPlanner,
  getMyPlanner,
  completeTask,
  syncCalendar,
  getPlannerById,
  getAllPlanners,
  getCalendarAuthUrl,
  calendarCallback,
  getCalendarStatus,
  analyzeResume
} from "../controllers/planner.controller.js";
import { upload } from "../middlewares/multer.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/create", isAuth ,createPlanner);
router.get("/my",isAuth, getMyPlanner);
router.post("/complete",isAuth, completeTask);
router.post("/calendar",isAuth, syncCalendar);
router.get("/calendar/auth", isAuth, getCalendarAuthUrl);
router.get("/calendar/callback", calendarCallback);
router.get("/calendar/status", isAuth, getCalendarStatus);
router.get("/all", isAuth, getAllPlanners);
router.get("/user", isAuth, getAllPlanners);
router.get("/:id", isAuth, getPlannerById);

router.post("/analyze-resume", isAuth, upload.single("resume"), analyzeResume);


export default router;
