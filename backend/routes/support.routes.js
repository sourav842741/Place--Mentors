import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  chatWithSupportAI,
  escalateToTicket,
} from "../controllers/support.controller.js";

const router = express.Router();

// AI Chat — no file upload
router.post("/ai-chat", isAuth, asyncHandler(chatWithSupportAI));

// Escalate to Ticket — allows image upload like regular tickets
router.post(
  "/escalate-ticket",
  isAuth,
  upload.single("image"),
  asyncHandler(escalateToTicket)
);

export default router;

