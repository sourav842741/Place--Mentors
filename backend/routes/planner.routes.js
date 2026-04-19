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
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = express.Router();

router.post("/create", maintenanceCheck, isAuth ,createPlanner);
router.get("/my", maintenanceCheck, isAuth, getMyPlanner);
router.post("/complete", maintenanceCheck, isAuth, completeTask);
router.post("/calendar", maintenanceCheck, isAuth, syncCalendar);
router.get("/calendar/auth", maintenanceCheck, isAuth, getCalendarAuthUrl);
router.get("/calendar/callback", calendarCallback);
router.get("/calendar/status", maintenanceCheck, isAuth, getCalendarStatus);
router.get("/all", maintenanceCheck, isAuth, getAllPlanners);
router.get("/user", maintenanceCheck, isAuth, getAllPlanners);
router.get("/:id", maintenanceCheck, isAuth, getPlannerById);

router.post("/analyze-resume", maintenanceCheck, isAuth, upload.single("resume"), analyzeResume);


export default router;
