import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import validate from "../middlewares/validate.js";
import {
  chatWithSupportAI as chatWithSupportAISchema,
  escalateToTicket as escalateToTicketSchema,
} from "../validators/support.validator.js";

import {
  chatWithSupportAI,
  escalateToTicket,
} from "../controllers/support.controller.js";

const router = express.Router();

// AI Chat — no file upload
router.post("/ai-chat", isAuth, validate(chatWithSupportAISchema), asyncHandler(chatWithSupportAI));

// Escalate to Ticket — allows image upload like regular tickets
router.post(
  "/escalate-ticket",
  isAuth,
  upload.single("image"),
  validate(escalateToTicketSchema),
  asyncHandler(escalateToTicket)
);

export default router;
