import Doubt from "../models/Doubt.js";
import Reply from "../models/Reply.js";
import { askAi } from "../services/openRouter.service.js";
import mongoose from "mongoose";

// Helper for standardized response
const sendResponse = (res, statusCode, success, message, data = null) => {
  const payload = { success, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

//  Ask Doubt (AI + Save)
export const askDoubt = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return sendResponse(res, 400, false, "Question is required");
    }
    if (question.trim().length < 5) {
      return sendResponse(res, 400, false, "Question too short (min 5 chars)");
    }
    if (question.length > 2000) {
      return sendResponse(res, 400, false, "Question too long (max 2000 chars)");
    }

    let aiAnswer = null;

    try {
      aiAnswer = await askAi([
        {
          role: "user",
          content: question.trim(),
        },
      ]);
    } catch (error) {
      console.error("AI FAILED:", error.message);
    }

    const doubt = await Doubt.create({
      user: req.user?._id,
      question: question.trim(),
      aiAnswer,
    });

    await doubt.populate("user", "fullName avatar");

    // Emit the full doubt so clients can prepend without refetch
    req.io.emit("new_doubt", { doubt });

    return sendResponse(res, 201, true, "Doubt posted successfully", doubt);
  } catch (err) {
    return sendResponse(res, 500, false, "Failed to process doubt");
  }
};

//  Get all doubts (paginated)
export const getDoubts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const [doubts, total] = await Promise.all([
      Doubt.find()
        .populate("user", "fullName avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Doubt.countDocuments(),
    ]);

    const pages = Math.ceil(total / limit);

    return sendResponse(res, 200, true, "Doubts fetched", {
      doubts,
      page,
      pages,
      total,
      limit,
    });
  } catch (err) {
    return sendResponse(res, 500, false, "Failed to fetch doubts");
  }
};

//  Add Reply + SOCKET EMIT
export const addReply = async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return sendResponse(res, 400, false, "Answer is required");
    }
    if (answer.trim().length < 2) {
      return sendResponse(res, 400, false, "Answer too short (min 2 chars)");
    }
    if (answer.length > 5000) {
      return sendResponse(res, 400, false, "Answer too long (max 5000 chars)");
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendResponse(res, 400, false, "Invalid doubt ID");
    }

    const reply = await Reply.create({
      doubt: req.params.id,
      user: req.user._id,
      answer: answer.trim(),
    });

    const populatedReply = await Reply.findById(reply._id)
      .populate("user", "fullName avatar")
      .lean();

    // Increment replyCount on the doubt
    await Doubt.findByIdAndUpdate(req.params.id, { $inc: { replyCount: 1 } });

    const doubt = await Doubt.findById(req.params.id).populate("user", "fullName avatar").lean();

    if (!doubt) {
      return sendResponse(res, 404, false, "Doubt not found");
    }

    req.io.to(`doubt-${req.params.id}`).emit("new_reply", {
      doubtId: req.params.id,
      reply: populatedReply,
    });

    if (doubt.user._id.toString() !== req.user._id.toString()) {
      req.io.to(doubt.user._id.toString()).emit("notification", {
        message: `${req.user.fullName} replied to your doubt 💬`,
        time: new Date().toLocaleString(),
      });
    }

    return sendResponse(res, 201, true, "Reply added", populatedReply);
  } catch (err) {
    return sendResponse(res, 500, false, "Failed to add reply");
  }
};

//  Get Replies (paginated)
export const getReplies = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendResponse(res, 400, false, "Invalid doubt ID");
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [replies, total] = await Promise.all([
      Reply.find({ doubt: req.params.id })
        .populate("user", "fullName avatar")
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Reply.countDocuments({ doubt: req.params.id }),
    ]);

    const pages = Math.ceil(total / limit);

    return sendResponse(res, 200, true, "Replies fetched", {
      replies,
      page,
      pages,
      total,
      limit,
    });
  } catch (err) {
    return sendResponse(res, 500, false, "Failed to fetch replies");
  }
};

const getOwnerId = (doc) => doc?.user?._id || doc?.user;

export const updateDoubtController = async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid doubt ID");
    }

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return sendResponse(res, 400, false, "Question is required");
    }
    if (question.trim().length < 5) {
      return sendResponse(res, 400, false, "Question too short (min 5 chars)");
    }
    if (question.length > 2000) {
      return sendResponse(res, 400, false, "Question too long (max 2000 chars)");
    }

    const doubt = await Doubt.findById(id);
    if (!doubt) {
      return sendResponse(res, 404, false, "Doubt not found");
    }

    const ownerId = getOwnerId(doubt);
    if (ownerId.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, "You are not allowed to edit this doubt");
    }

    doubt.question = question.trim();
    await doubt.save();

    const updatedDoubt = await Doubt.findById(doubt._id)
      .populate("user", "fullName avatar")
      .lean();

    if (req.io) {
      req.io.to(`doubt-${doubt._id}`).emit("doubt_updated", {
        doubtId: doubt._id,
        doubt: updatedDoubt,
      });
    }

    return sendResponse(res, 200, true, "Doubt updated", updatedDoubt);
  } catch (err) {
    return sendResponse(res, 500, false, "Failed to update doubt");
  }
};

export const deleteDoubtController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid doubt ID");
    }

    const doubt = await Doubt.findById(id);
    if (!doubt) {
      return sendResponse(res, 404, false, "Doubt not found");
    }

    const ownerId = getOwnerId(doubt);
    if (ownerId.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, "You are not allowed to delete this doubt");
    }

    // Delete related replies first
    await Reply.deleteMany({ doubt: id });

    await Doubt.findByIdAndDelete(id);

    if (req.io) {
      req.io.emit("doubt_deleted", { doubtId: id });
    }

    return sendResponse(res, 200, true, "Doubt deleted", { doubtId: id });
  } catch (err) {
    return sendResponse(res, 500, false, "Failed to delete doubt");
  }
};

export const updateReplyController = async (req, res) => {
  try {
    const { id } = req.params;
    const { answer } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid reply ID");
    }

    if (!answer || typeof answer !== "string" || answer.trim().length === 0) {
      return sendResponse(res, 400, false, "Answer is required");
    }
    if (answer.trim().length < 2) {
      return sendResponse(res, 400, false, "Answer too short (min 2 chars)");
    }
    if (answer.length > 5000) {
      return sendResponse(res, 400, false, "Answer too long (max 5000 chars)");
    }

    const reply = await Reply.findById(id);
    if (!reply) {
      return sendResponse(res, 404, false, "Reply not found");
    }

    const ownerId = getOwnerId(reply);
    if (ownerId.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, "You are not allowed to edit this reply");
    }

    reply.answer = answer.trim();
    await reply.save();

    const updatedReply = await Reply.findById(reply._id)
      .populate("user", "fullName avatar")
      .lean();

    if (req.io) {
      req.io.to(`doubt-${reply.doubt}`).emit("reply_updated", {
        doubtId: reply.doubt,
        replyId: reply._id,
        reply: updatedReply,
      });
    }

    return sendResponse(res, 200, true, "Reply updated", updatedReply);
  } catch (err) {
    return sendResponse(res, 500, false, "Failed to update reply");
  }
};

export const deleteReplyController = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendResponse(res, 400, false, "Invalid reply ID");
    }

    const reply = await Reply.findById(id);
    if (!reply) {
      return sendResponse(res, 404, false, "Reply not found");
    }

    const ownerId = getOwnerId(reply);
    if (ownerId.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, "You are not allowed to delete this reply");
    }

    const doubtId = reply.doubt;

    await Reply.findByIdAndDelete(id);

    // Decrement replyCount on delete (avoid negative)
    await Doubt.findByIdAndUpdate(doubtId, {
      $inc: { replyCount: -1 },
    });

    if (req.io) {
      req.io.to(`doubt-${doubtId}`).emit("reply_deleted", {
        doubtId,
        replyId: id,
      });
    }

    return sendResponse(res, 200, true, "Reply deleted", { replyId: id, doubtId });
  } catch (err) {
    return sendResponse(res, 500, false, "Failed to delete reply");
  }
};

export const toggleUpvote = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return sendResponse(res, 400, false, "Invalid reply ID");
    }


    const reply = await Reply.findById(req.params.id);

    if (!reply) {
      return sendResponse(res, 404, false, "Reply not found");
    }

    const userId = req.user._id;

    if (!Array.isArray(reply.upvotes)) {
      reply.upvotes = [];
    }

    const already = reply.upvotes.some((id) => id.toString() === userId.toString());

    if (already) {
      reply.upvotes = reply.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      reply.upvotes.push(userId);
    }

    await reply.save();

    const doubtId = reply.doubt;
    const upvotesCount = reply.upvotes.length;

    req.io.to(`doubt-${doubtId}`).emit("reply_upvote", {
      replyId: reply._id,
      upvotesCount,
    });

    return sendResponse(res, 200, true, already ? "Upvote removed" : "Upvoted", {
      upvotes: upvotesCount,
    });
  } catch (err) {
    return sendResponse(res, 500, false, "Failed to toggle upvote");
  }
};
