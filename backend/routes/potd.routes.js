import { Router } from "express";
import {
  generatePotd,
  getTodayPotd,
  submitPotd,
  getPotdStatus,
  completePotd,
} from "../controllers/potd.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.get("/", getTodayPotd);
router.post("/generate", isAuth, generatePotd); // Manual trigger (admin?)
router.post("/submit", isAuth, submitPotd);
router.get("/status", isAuth, getPotdStatus);
router.post("/complete", isAuth, completePotd);

export default router;
