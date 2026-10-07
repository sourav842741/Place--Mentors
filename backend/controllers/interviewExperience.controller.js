import InterviewExperience from "../models/InterviewExperience.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get all interview experiences with filtering & search
// @route   GET /api/interview-experiences
export const getAllExperiences = asyncHandler(async (req, res) => {
  const { search, company, outcome, difficulty, sort, page = 1, limit = 12 } = req.query;

  const query = {};

  if (company && company !== "All") {
    query.company = new RegExp(`^${company}$`, "i");
  }

  if (outcome && outcome !== "All") {
    query.outcome = outcome;
  }

  if (difficulty && difficulty !== "All") {
    query.difficulty = difficulty;
  }

  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { company: { $regex: s, $options: "i" } },
      { role: { $regex: s, $options: "i" } },
      { keyTopics: { $regex: s, $options: "i" } },
      { advice: { $regex: s, $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);
  const skip = (pageNum - 1) * limitNum;

  let sortOption = { createdAt: -1 };
  if (sort === "upvotes") {
    sortOption = { upvotes: -1, createdAt: -1 };
  }

  const [experiences, total] = await Promise.all([
    InterviewExperience.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("user", "fullName avatar"),
    InterviewExperience.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: experiences,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
  });
});

// @desc    Get single interview experience by ID
// @route   GET /api/interview-experiences/:id
export const getExperienceById = asyncHandler(async (req, res) => {
  const exp = await InterviewExperience.findById(req.params.id).populate("user", "fullName avatar");
  if (!exp) {
    return res.status(404).json({ success: false, message: "Experience not found" });
  }

  res.status(200).json({
    success: true,
    data: exp,
  });
});

// @desc    Submit a new interview experience
// @route   POST /api/interview-experiences
export const createExperience = asyncHandler(async (req, res) => {
  const {
    company,
    role,
    candidateName,
    driveType,
    outcome,
    difficulty,
    ctc,
    year,
    rounds,
    keyTopics,
    advice,
  } = req.body;

  if (!company || !role || !rounds || !rounds.length) {
    return res.status(400).json({
      success: false,
      message: "Company, role, and at least one round breakdown are required.",
    });
  }

  const exp = await InterviewExperience.create({
    company,
    role,
    candidateName: candidateName || req.user?.fullName || "Anonymous Student",
    user: req.user?._id,
    driveType: driveType || "On-Campus",
    outcome: outcome || "Offer Received",
    difficulty: difficulty || "Medium",
    ctc: ctc || "",
    year: year || new Date().getFullYear(),
    rounds,
    keyTopics: keyTopics || [],
    advice: advice || "",
  });

  res.status(201).json({
    success: true,
    message: "Interview experience published successfully!",
    data: exp,
  });
});

// @desc    Upvote / React to an experience
// @route   POST /api/interview-experiences/:id/upvote
export const toggleUpvoteExperience = asyncHandler(async (req, res) => {
  const exp = await InterviewExperience.findById(req.params.id);
  if (!exp) {
    return res.status(404).json({ success: false, message: "Experience not found" });
  }

  const userId = req.user?._id;
  if (!userId) {
    // If not authenticated, simply increment upvotes
    exp.upvotes = (exp.upvotes || 0) + 1;
    await exp.save();
    return res.status(200).json({ success: true, upvotes: exp.upvotes });
  }

  const hasUpvoted = exp.upvotedBy?.some((u) => u.toString() === userId.toString());
  if (hasUpvoted) {
    exp.upvotedBy = exp.upvotedBy.filter((u) => u.toString() !== userId.toString());
    exp.upvotes = Math.max(0, (exp.upvotes || 1) - 1);
  } else {
    exp.upvotedBy.push(userId);
    exp.upvotes = (exp.upvotes || 0) + 1;
  }

  await exp.save();

  res.status(200).json({
    success: true,
    upvotes: exp.upvotes,
    hasUpvoted: !hasUpvoted,
  });
});
