import express from "express";
import {
  startCall,
  getHistory,
  getReport,
  webhook,
  updateStatus,
} from "../controllers/voice.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.use(isAuth);

// Protected APIs
router.post("/start-call", startCall);
router.get("/history", getHistory);
router.get("/report/:id", getReport);
router.post("/status", updateStatus);

// Public webhook (Twilio calls this)
router.post("/webhook", webhook);

export default router;
