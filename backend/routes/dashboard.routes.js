import express from "express";
import { getWeeklyStats, getStreak , getTaskStats } from "../controllers/dashboard.controller.js";
import isAuth from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = express.Router();

router.get("/weekly", maintenanceCheck, isAuth, getWeeklyStats);
router.get("/streak", maintenanceCheck, isAuth, getStreak);
router.get("/task-stats", maintenanceCheck, isAuth, getTaskStats);

export default router;
