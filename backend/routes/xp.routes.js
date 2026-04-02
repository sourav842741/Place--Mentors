import express from "express";
import { updateTimeSpent, completeQuiz , getUserBadges } from "../controllers/xp.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/time", isAuth, updateTimeSpent);
router.post("/quiz", isAuth, completeQuiz);
router.get("/badges", isAuth, getUserBadges);

export default router;