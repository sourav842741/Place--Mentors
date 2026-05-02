import { Router } from "express";
import {
  generateCpotd,
  getTodayCpotd,
  submitCpotd,
  getCpotdStatus,
  completeCpotd,
} from "../controllers/cpotd.controller.js";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/admin.middleware.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = Router();

router.get("/", getTodayCpotd);
router.post("/generate", maintenanceCheck, isAuth, isAdmin, generateCpotd);
router.post("/submit", maintenanceCheck, isAuth, submitCpotd);
router.get("/status", maintenanceCheck, isAuth, getCpotdStatus);
router.post("/complete", maintenanceCheck, isAuth, completeCpotd);

export default router;
