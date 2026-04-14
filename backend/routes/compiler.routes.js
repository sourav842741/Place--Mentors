import { Router } from "express";
import { runCode, runCodeTests } from "../controllers/compilerController.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.post("/run", isAuth, runCode);
router.post("/runTests", isAuth, runCodeTests);

export default router;

