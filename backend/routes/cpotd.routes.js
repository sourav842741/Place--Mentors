import { Router } from "express";
import { generateCpotd, getTodayCpotd, submitCpotd } from "../controllers/cpotd.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.get("/", getTodayCpotd);
router.post("/generate", generateCpotd);
router.post("/submit", isAuth, submitCpotd);

export default router;
