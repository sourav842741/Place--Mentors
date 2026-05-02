import { Router } from "express";
import {
  generatePotd,
  getTodayPotd,
  submitPotd,
  getPotdStatus,
  completePotd,
} from "../controllers/potd.controller.js";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/admin.middleware.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = Router();

router.get("/", getTodayPotd);
router.post("/generate", maintenanceCheck, isAuth, isAdmin, generatePotd); // Manual trigger (admin?)
router.post("/submit", maintenanceCheck, isAuth, submitPotd);
router.get("/status", maintenanceCheck, isAuth, getPotdStatus);
router.post("/complete", maintenanceCheck, isAuth, completePotd);

export default router;
