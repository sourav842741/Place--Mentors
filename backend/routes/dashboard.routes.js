import express from "express";
import { getWeeklyStats, getStreak , getTaskStats } from "../controllers/dashboard.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/weekly",isAuth, getWeeklyStats);
router.get("/streak",isAuth, getStreak);
router.get("/task-stats",isAuth, getTaskStats);

export default router;
