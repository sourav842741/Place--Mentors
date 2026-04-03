import express from "express";
import { getDailyLeaderboard } from "../controllers/leaderboard.controller.js";

const router = express.Router();

router.get("/daily", getDailyLeaderboard);

export default router;