import express from "express";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";
import { getDailyLeaderboard } from "../controllers/leaderboard.controller.js";

const router = express.Router();

router.get("/daily", maintenanceCheck, getDailyLeaderboard);

export default router;
