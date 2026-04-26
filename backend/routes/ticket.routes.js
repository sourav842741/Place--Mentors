import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import isAuth from "../middlewares/isAuth.js";
import isAdmin from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.js";
import validate from "../middlewares/validate.js";
import {
  createTicket as createTicketSchema,
  replyToTicket as replyToTicketSchema,
  updateTicketStatus as updateTicketStatusSchema,
} from "../validators/ticket.validator.js";

import {
  createTicket,
  getMyTickets,
  getTicketDetail,
  replyToTicket,
  reopenTicket,
  getAllTickets,
  updateTicketStatus,
  deleteTicket,
  getTicketStats,
} from "../controllers/ticket.controller.js";

const router = express.Router();

// ================= USER ROUTES =================
router.post(
  "/",
  isAuth,
  upload.single("image"),
  validate(createTicketSchema),
  asyncHandler(createTicket)
);

router.get("/my", isAuth, asyncHandler(getMyTickets));
router.get("/:id", isAuth, asyncHandler(getTicketDetail));
router.post("/:id/reply", isAuth, validate(replyToTicketSchema), asyncHandler(replyToTicket));
router.patch("/:id/reopen", isAuth, asyncHandler(reopenTicket));

// ================= ADMIN ROUTES =================
router.get("/admin/all", isAuth, isAdmin, asyncHandler(getAllTickets));
router.get("/admin/stats", isAuth, isAdmin, asyncHandler(getTicketStats));
router.patch("/admin/:id/status", isAuth, isAdmin, validate(updateTicketStatusSchema), asyncHandler(updateTicketStatus));
router.delete("/admin/:id", isAuth, isAdmin, asyncHandler(deleteTicket));

export default router;
