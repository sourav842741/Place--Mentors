import { Router } from "express";
import { runCode, runCodeTests } from "../controllers/compilerController.js";
import isAuth from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = Router();

router.post("/run", maintenanceCheck, isAuth, runCode);
router.post("/runTests", maintenanceCheck, isAuth, runCodeTests);

export default router;

