import { Router } from "express";
import { runCode } from "../controllers/compilerController.js";
import isAuth from "../middlewares/isAuth.js";

const router = Router();

router.post("/run", isAuth, runCode);

export default router;

