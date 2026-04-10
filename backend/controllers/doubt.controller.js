import Doubt from "../models/Doubt.js";
import Reply from "../models/Reply.js";
import { askAi } from "../services/openRouter.service.js";

//  Ask Doubt (AI + Save)
export const askDoubt = async (req, res) => {
  try {
    const { question } = req.body;

    const aiAnswer = await askAi([{ role: "user", content: question }]);

    const doubt = await Doubt.create({
      user: req.user?._id,
      question,
      aiAnswer,
    });

    await doubt.populate("user", "fullName avatar"); // Populate for emit

    // Emit new doubt to all
    req.io.emit("new_doubt");

    res.json(doubt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  Get all doubts
export const getDoubts = async (req, res) => {
  const doubts = await Doubt.find()
    .populate("user", "fullName avatar")
    .sort({ createdAt: -1 })
    .lean();
  res.json(doubts);
};

//  Add Reply + SOCKET EMIT
export const addReply = async (req, res) => {
  try {
    const { answer } = req.body;

    const reply = await Reply.create({
      doubt: req.params.id,
      user: req.user._id,
      answer,
    });

    const populatedReply = await Reply.findById(reply._id)
      .populate("user", "fullName avatar")
      .lean();

    const doubt = await Doubt.findById(req.params.id)
      .populate("user", "fullName avatar")
      .lean();

    //  REALTIME REPLY (thread update)
    req.io.to(`doubt-${req.params.id}`).emit("new_reply", {
      doubtId: req.params.id,
    });

    //  NOTIFICATION (MAIN FIX)
    if (doubt.user._id.toString() !== req.user._id.toString()) {
      req.io.to(doubt.user._id.toString()).emit("notification", {
        message: `${req.user.fullName} replied to your doubt 💬`,
        time: new Date().toLocaleString(),
      });
    }

    //  SEND RESPONSE LAST
    res.json(populatedReply);
  } catch (err) {
    console.error("Add reply error:", err);
    res.status(500).json({ message: err.message });
  }
};

//  Get Replies
export const getReplies = async (req, res) => {
  const replies = await Reply.find({ doubt: req.params.id })
    .populate("user", "fullName avatar")
    .lean();

  res.json(replies);
};

export const toggleUpvote = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    const userId = req.user._id;

    if (!Array.isArray(reply.upvotes)) {
      reply.upvotes = [];
    }

    const already = reply.upvotes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (already) {
      reply.upvotes = reply.upvotes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      reply.upvotes.push(userId);
    }

    await reply.save();

    // Find doubt for room emit
    const doubtId = reply.doubt;

    // Emit real-time upvote update to doubt room
    req.io.to(`doubt-${doubtId}`).emit("reply_upvote", {
      replyId: reply._id,
      upvotesCount: reply.upvotes.length,
    });

    res.json({
      success: true,
      upvotes: reply.upvotes.length,
    });
  } catch (err) {
    console.error(" ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
