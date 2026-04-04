import express from "express";
import { generateResumePDF } from "../controllers/ai.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/generate-resume-pdf", isAuth, generateResumePDF);

export default router;