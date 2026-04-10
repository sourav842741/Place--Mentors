import Notes from "../models/notes.model.js";
import UserModel from "../models/user.model.js";
import { generateAIResponse } from "../services/ai2.service.js";
import { buildPrompt } from "../utils/promptBuilder.js";

export const generateNotes = async (req, res) => {
  try {
    const {
      topic,
      classLevel,
      examType,
      revisionMode = false,
      includeDiagram = false,
      includeChart = false,
    } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.credits < 10) {
      user.isCreditAvailable = false;
      await user.save();

      return res.status(403).json({
        message: "Insufficient credits",
      });
    }

    const prompt = buildPrompt({
      topic,
      classLevel,
      examType,
      revisionMode,
      includeDiagram,
      includeChart,
    });

    //  AI CALL
    let aiResponse = await generateAIResponse(prompt);

    //  SAFETY CHECK
    if (!aiResponse || typeof aiResponse !== "object") {
      return res.status(500).json({
        message: "Invalid AI response format",
      });
    }

    //  SANITIZE (VERY IMPORTANT)
    if (aiResponse.subTopics) {
      const fixed = {};
      Object.keys(aiResponse.subTopics).forEach((key) => {
        if (["⭐", "⭐⭐", "⭐⭐⭐"].includes(key)) {
          fixed[key] = aiResponse.subTopics[key];
        }
      });
      aiResponse.subTopics = fixed;
    }

    //  DEFAULT FALLBACK (avoid crash)
    aiResponse.revisionPoints = aiResponse.revisionPoints || [];
    aiResponse.questions = aiResponse.questions || {
      short: [],
      long: [],
      diagram: "",
    };
    aiResponse.diagram = aiResponse.diagram || {
      type: "flowchart",
      data: "",
    };
    aiResponse.charts = aiResponse.charts || [];

    //  SAVE NOTE
    const notes = await Notes.create({
      userId: user._id,
      topic,
      classLevel,
      examType,
      revisionMode,
      includeDiagram,
      includeChart,
      content: aiResponse,
    });

    //  UPDATE USER
    user.credits -= 10;
    if (user.credits <= 0) user.isCreditAvailable = false;

    if (!Array.isArray(user.notes)) {
      user.notes = [];
    }

    user.notes.push(notes._id);

    await user.save();

    return res.status(200).json({
      data: aiResponse,
      noteId: notes._id,
      creditsLeft: user.credits,
    });
  } catch (error) {
    console.error("GENERATE NOTES ERROR:", error);

    return res.status(500).json({
      error: "AI generation failed",
      message: error.message,
    });
  }
};
