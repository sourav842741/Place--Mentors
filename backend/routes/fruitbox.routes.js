import express from "express";
import { getProgress, updateProgress, resetProgress } from "../controllers/fruitbox.controller.js";
import isAuth from "../middlewares/isAuth.js";
import maintenanceCheck from "../middlewares/maintenanceCheck.js";

const router = express.Router();

router.get("/progress", maintenanceCheck, isAuth, getProgress);
router.post("/progress", maintenanceCheck, isAuth, updateProgress);
router.delete("/progress", maintenanceCheck, isAuth, resetProgress);

export default router;
