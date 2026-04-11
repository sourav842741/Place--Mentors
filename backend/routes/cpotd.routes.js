import { Router } from "express";
import {
  generateCpotd,
  getTodayCpotd,
  submitCpotd,
  getCpotdStatus,
  completeCpotd,
} from "../controllers/cpotd.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.get("/", getTodayCpotd);
router.post("/generate", generateCpotd);
router.post("/submit", isAuth, submitCpotd);
router.get("/status", isAuth, getCpotdStatus);
router.post("/complete", isAuth, completeCpotd);

export default router;
