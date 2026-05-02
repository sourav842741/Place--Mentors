import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Ticket from "../models/Ticket.model.js";
import TicketReply from "../models/TicketReply.model.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import {
  sendTicketCreatedEmail,
  sendTicketRepliedEmail,
  sendTicketSolvedEmail,
  sendTicketReopenedEmail,
  sendAdminNotificationEmail,
} from "../services/email/ticketEmail.service.js";

/* =====================================================
   HELPERS
===================================================== */

export const generateTicketId = async () => {
  const prefix = "PM";
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `${prefix}-${num}`;

    const exists = await Ticket.findOne({ ticketId });
    if (!exists) return ticketId;

    attempts++;
  }

  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}`;
};

/* =====================================================
   CREATE TICKET (User)
===================================================== */

export const createTicket = asyncHandler(async (req, res) => {
  const { subject, category, priority, description, email, mobile } = req.body;
  const userId = req.user._id;

  const validPriorities = ["Low", "Medium", "High"];
  const ticketPriority = validPriorities.includes(priority) ? priority : "Low";

  let imageUrl = "";
  if (req.file) {
    const uploaded = await uploadOnCloudinary(req.file.path);
    if (uploaded?.secure_url) {
      imageUrl = uploaded.secure_url;
    }
  }

  const ticketId = await generateTicketId();

  const ticket = await Ticket.create({
    ticketId,
    user: userId,
    subject: subject.trim(),
    category,
    priority: ticketPriority,
    description: description.trim(),
    email: email?.trim() || req.user.email,
    mobile: mobile?.trim() || "",
    image: imageUrl,
  });

  const populatedTicket = await Ticket.findById(ticket._id)
    .populate("user", "fullName email avatar")
    .lean();

  try {
    await sendTicketCreatedEmail(populatedTicket.email, {
      ...populatedTicket,
      userName: populatedTicket.user?.fullName,
    });
  } catch {
    // Silently fail email
  }

  if (req.io) {
    req.io.to("admins").emit("ticket:updated", {
      ticketId: ticket._id,
      action: "created",
      ticket: populatedTicket,
    });
  }

  res.status(201).json(new ApiResponse(201, populatedTicket, "Ticket created successfully"));
});

/* =====================================================
   GET MY TICKETS (User)
===================================================== */

export const getMyTickets = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { status, page = 1, limit = 20 } = req.query;

  const filter = { user: userId };
  if (status && ["Open", "In Progress", "Solved", "Rejected"].includes(status)) {
    filter.status = status;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "fullName email avatar")
      .lean(),
    Ticket.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        tickets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "Tickets fetched successfully"
    )
  );
});

/* =====================================================
   GET TICKET DETAIL (User + Admin)
===================================================== */

export const getTicketDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const isAdmin =
    req.user.role === "admin" ||
    req.user.role === "superadmin" ||
    req.user.email === process.env.SUPER_ADMIN_EMAIL;

  const ticket = await Ticket.findById(id).populate("user", "fullName email avatar").lean();

  if (!ticket) throw new ApiError(404, "Ticket not found");

  if (!isAdmin && ticket.user._id.toString() !== userId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  const replies = await TicketReply.find({ ticket: id, isInternal: false })
    .populate("sender", "fullName email avatar role")
    .sort({ createdAt: 1 })
    .lean();

  let internalNotes = [];
  if (isAdmin) {
    internalNotes = await TicketReply.find({ ticket: id, isInternal: true })
      .populate("sender", "fullName email avatar role")
      .sort({ createdAt: 1 })
      .lean();
  }

  res
    .status(200)
    .json(new ApiResponse(200, { ticket, replies, internalNotes }, "Ticket detail fetched"));
});

/* =====================================================
   REPLY TO TICKET (User + Admin)
===================================================== */

export const replyToTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message, isInternal = false } = req.body;
  const userId = req.user._id;
  const isAdmin =
    req.user.role === "admin" ||
    req.user.role === "superadmin" ||
    req.user.email === process.env.SUPER_ADMIN_EMAIL;

  const ticket = await Ticket.findById(id).populate("user", "fullName email");
  if (!ticket) throw new ApiError(404, "Ticket not found");

  if (!isAdmin && ticket.user._id.toString() !== userId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  if (isInternal && !isAdmin) {
    throw new ApiError(403, "Only admins can add internal notes");
  }

  if (!isAdmin && ["Solved", "Rejected"].includes(ticket.status)) {
    throw new ApiError(400, "Cannot reply to a closed ticket. Reopen it first.");
  }

  const reply = await TicketReply.create({
    ticket: id,
    sender: userId,
    senderRole: isAdmin ? (req.user.role === "superadmin" ? "superadmin" : "admin") : "user",
    message: message.trim(),
    isInternal: isInternal === true,
  });

  ticket.replyCount = (ticket.replyCount || 0) + 1;
  ticket.lastReplyAt = new Date();

  const oldStatus = ticket.status;
  if (isAdmin && ticket.status === "Open") {
    ticket.status = "In Progress";
  }

  await ticket.save();

  const populatedReply = await TicketReply.findById(reply._id)
    .populate("sender", "fullName email avatar role")
    .lean();

  try {
    if (isAdmin && !isInternal) {
      await sendTicketRepliedEmail(
        ticket.email,
        {
          ...ticket.toObject(),
          userName: ticket.user?.fullName,
        },
        message.trim(),
        true
      );
    } else if (!isAdmin && !isInternal) {
      await sendAdminNotificationEmail(
        {
          ...ticket.toObject(),
          userName: ticket.user?.fullName,
        },
        message.trim()
      );
    }
  } catch {
    // Silently fail email
  }

  if (req.io) {
    const eventPayload = {
      ticketId: id,
      action: "replied",
      reply: populatedReply,
      newStatus: ticket.status !== oldStatus ? ticket.status : undefined,
      replyCount: ticket.replyCount,
    };

    req.io.to(ticket.user.toString()).emit("ticket:updated", eventPayload);
    req.io.to("admins").emit("ticket:updated", eventPayload);
  }

  res.status(201).json(new ApiResponse(201, populatedReply, "Reply added successfully"));
});

/* =====================================================
   REOPEN TICKET (User)
===================================================== */

export const reopenTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const ticket = await Ticket.findById(id).populate("user", "fullName email");
  if (!ticket) throw new ApiError(404, "Ticket not found");

  if (ticket.user._id.toString() !== userId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  if (ticket.status !== "Solved") {
    throw new ApiError(400, "Only solved tickets can be reopened");
  }

  ticket.status = "Open";
  ticket.isReopened = true;
  ticket.reopenedAt = new Date();
  ticket.solvedAt = null;
  await ticket.save();

  const updatedTicket = await Ticket.findById(id).populate("user", "fullName email avatar").lean();

  try {
    await sendTicketReopenedEmail(updatedTicket.email, {
      ...updatedTicket,
      userName: updatedTicket.user?.fullName,
    });
  } catch {
    // Silently fail email
  }

  if (req.io) {
    req.io.to(ticket.user.toString()).emit("ticket:updated", {
      ticketId: id,
      action: "reopened",
      ticket: updatedTicket,
    });
    req.io.to("admins").emit("ticket:updated", {
      ticketId: id,
      action: "reopened",
      ticket: updatedTicket,
    });
  }

  res.status(200).json(new ApiResponse(200, updatedTicket, "Ticket reopened successfully"));
});

/* =====================================================
   ADMIN: GET ALL TICKETS
===================================================== */

export const getAllTickets = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    category,
    search,
    page = 1,
    limit = 20,
    sortBy = "updatedAt",
    sortOrder = "desc",
  } = req.query;

  const filter = {};

  if (status && ["Open", "In Progress", "Solved", "Rejected"].includes(status)) {
    filter.status = status;
  }
  if (priority && ["Low", "Medium", "High"].includes(priority)) {
    filter.priority = priority;
  }
  if (category) {
    const validCategories = [
      "Login Issue",
      "Payment",
      "Premium",
      "Bug Report",
      "Resume",
      "Interview",
      "Account",
      "Other",
    ];
    if (validCategories.includes(category)) {
      filter.category = category;
    }
  }

  if (search?.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { ticketId: searchRegex },
      { subject: searchRegex },
      { email: searchRegex },
      { description: searchRegex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const [tickets, total] = await Promise.all([
    Ticket.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "fullName email avatar")
      .lean(),
    Ticket.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        tickets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
      "All tickets fetched successfully"
    )
  );
});

/* =====================================================
   ADMIN: UPDATE TICKET STATUS
===================================================== */

export const updateTicketStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, internalNote } = req.body;

  const validStatuses = ["Open", "In Progress", "Solved", "Rejected"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status: ${status}`);
  }

  const ticket = await Ticket.findById(id).populate("user", "fullName email");
  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const oldStatus = ticket.status;

  ticket.status = status;

  if (internalNote !== undefined) {
    ticket.internalNote = internalNote;
  }

  if (status === "Solved") {
    ticket.solvedAt = new Date();
  } else if (status === "Open" && oldStatus !== "Open") {
    ticket.solvedAt = null;
  }

  await ticket.save();

  const updatedTicket = await Ticket.findById(id).populate("user", "fullName email avatar").lean();

  const shouldSendSolvedEmail = status === "Solved" && oldStatus !== "Solved";

  if (shouldSendSolvedEmail) {
    const toEmail = updatedTicket?.email || ticket?.email;
    const userName = updatedTicket?.user?.fullName || ticket?.user?.fullName || "User";

    if (toEmail && toEmail.includes("@")) {
      try {
        const emailPayload = {
          ...updatedTicket,
          userName,
        };
        await sendTicketSolvedEmail(toEmail, emailPayload);
      } catch {
        // Silently fail email
      }
    }
  }

  if (req.io) {
    const payload = {
      ticketId: id,
      action: "status_changed",
      status,
      oldStatus,
      ticket: updatedTicket,
    };
    req.io.to(ticket.user.toString()).emit("ticket:updated", payload);
    req.io.to("admins").emit("ticket:updated", payload);
  }

  res.status(200).json(new ApiResponse(200, updatedTicket, `Ticket status updated to ${status}`));
});

/* =====================================================
   ADMIN: DELETE TICKET
===================================================== */

export const deleteTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id);
  if (!ticket) throw new ApiError(404, "Ticket not found");

  await TicketReply.deleteMany({ ticket: id });
  await Ticket.findByIdAndDelete(id);

  if (req.io) {
    req.io.to(ticket.user.toString()).emit("ticket:updated", {
      ticketId: id,
      action: "deleted",
    });
    req.io.to("admins").emit("ticket:updated", {
      ticketId: id,
      action: "deleted",
    });
  }

  res.status(200).json(new ApiResponse(200, null, "Ticket deleted successfully"));
});

/* =====================================================
   ADMIN: TICKET STATS
===================================================== */

export const getTicketStats = asyncHandler(async (req, res) => {
  const [total, open, inProgress, solved, rejected, highPriority] = await Promise.all([
    Ticket.countDocuments(),
    Ticket.countDocuments({ status: "Open" }),
    Ticket.countDocuments({ status: "In Progress" }),
    Ticket.countDocuments({ status: "Solved" }),
    Ticket.countDocuments({ status: "Rejected" }),
    Ticket.countDocuments({ priority: "High", status: { $in: ["Open", "In Progress"] } }),
  ]);

  const categoryStats = await Ticket.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentTickets = await Ticket.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        open,
        inProgress,
        solved,
        rejected,
        highPriority,
        recentTickets,
        categoryStats,
      },
      "Ticket stats fetched successfully"
    )
  );
});
