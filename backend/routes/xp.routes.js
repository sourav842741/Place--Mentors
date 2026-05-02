import express from "express";
import { updateTimeSpent, completeQuiz, getUserBadges } from "../controllers/xp.controller.js";
import isAuth from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = express.Router();

router.post("/time", maintenanceCheck, isAuth, updateTimeSpent);
router.post("/quiz", maintenanceCheck, isAuth, completeQuiz);
router.get("/badges", maintenanceCheck, isAuth, getUserBadges);

export default router;
