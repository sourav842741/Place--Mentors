import express from "express";
import {
  generateResumePDF,
  generateAIContent,
  generateYoutubeSummary,
  getMotivation,
} from "../controllers/ai.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/generate-resume-pdf", isAuth, generateResumePDF);
router.post("/generate-content", isAuth, generateAIContent);
router.post("/youtube-summary", isAuth, generateYoutubeSummary);
router.get("/motivation", isAuth, getMotivation);

export default router;
