import express from "express";
import { getWeeklyStats } from "../controllers/dashboard.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/weekly",isAuth, getWeeklyStats);

export default router;