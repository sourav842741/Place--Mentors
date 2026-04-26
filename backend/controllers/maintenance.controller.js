import MaintenanceQuestion from '../models/MaintenanceQuestion.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// @desc    Get random question by type
// @route   GET /api/maintenance/random/:type
export const getRandomByType = asyncHandler(async (req, res) => {
  const { type } = req.params;
  
  if (!['hr', 'aptitude', 'coding', 'vocab', 'myth', 'shortcut', 'quote'].includes(type)) {
    throw new ApiError(400, 'Invalid question type');
  }

  const question = await MaintenanceQuestion.aggregate([
    { $match: { type, active: true } },
    { $sample: { size: 1 } },
    { $limit: 1 }
  ]);

  if (!question.length) {
    throw new ApiError(404, `No active ${type} questions found`);
  }

  res.status(200).json(
    new ApiResponse(200, question[0], `${type} question fetched`)
  );
});

// @desc    Get dashboard data (one random per type)
// @route   GET /api/maintenance/dashboard
export const getDashboardData = asyncHandler(async (req, res) => {
  const types = ['hr', 'aptitude', 'coding', 'vocab', 'myth', 'shortcut', 'quote'];
  
  const pipeline = types.map(type => ({
    $facet: {
      [`${type}`]: [
        { $match: { type, active: true } },
        { $sample: { size: 1 } }
      ]
    }
  }));

  // Simplified: fetch sequentially for reliability
  const data = {};
  for (const type of types) {
    try {
      const question = await MaintenanceQuestion.aggregate([
        { $match: { type, active: true } },
        { $sample: { size: 1 } }
      ]);
      if (question.length) {
        data[type] = question[0];
      }
    } catch (err) {
      // Skip if no questions
    }
  }

  res.status(200).json(
    new ApiResponse(200, data, 'Dashboard data fetched')
  );
});

// @desc    Get all question types with counts
// @route   GET /api/maintenance/all-types
export const getAllTypes = asyncHandler(async (req, res) => {
  const stats = await MaintenanceQuestion.aggregate([
    { $match: { active: true } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        sample: { $first: '$question' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json(
    new ApiResponse(200, stats, 'Types stats fetched')
  );
});

// ================= ADMIN CONTROLLERS =================

// @desc    List all questions (paginated, searchable)
// @route   GET /api/maintenance/list
export const listQuestions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    search,
    active
  } = req.query;

  const filter = { active: active === 'true' ? true : active === 'false' ? false : true };

  if (type) filter.type = type;
  if (search) {
    filter.$or = [
      { question: { $regex: search, $options: 'i' } },
      { answer: { $regex: search, $options: 'i' } }
    ];
  }

  const questions = await MaintenanceQuestion.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await MaintenanceQuestion.countDocuments(filter);

  res.status(200).json(
    new ApiResponse(200, {
      questions,
      pagination: {
        current: page * 1,
        pages: Math.ceil(total / limit),
        total
      }
    }, 'Questions listed')
  );
});

// @desc    Add new question
// @route   POST /api/maintenance/add
export const addQuestion = asyncHandler(async (req, res) => {
  const { type, question, answer, active, tags, difficulty } = req.body;

  if (!type || !question) {
    throw new ApiError(400, "Type and question are required");
  }

  const validTypes = ['hr', 'aptitude', 'coding', 'vocab', 'myth', 'shortcut', 'quote'];
  if (!validTypes.includes(type)) {
    throw new ApiError(400, "Invalid question type");
  }

  const created = await MaintenanceQuestion.create({
    type,
    question: String(question).trim(),
    answer: answer ? String(answer).trim() : "",
    active: typeof active === "boolean" ? active : true,
    tags: Array.isArray(tags) ? tags.filter(t => typeof t === "string").map(t => t.trim()) : [],
    difficulty: ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "medium",
  });

  res.status(201).json(
    new ApiResponse(201, created, 'Question added successfully')
  );
});

// @desc    Update question
// @route   PUT /api/maintenance/:id
export const updateQuestion = asyncHandler(async (req, res) => {
  const { type, question, answer, active, tags, difficulty } = req.body;
  const updateData = {};

  if (type !== undefined) {
    const validTypes = ['hr', 'aptitude', 'coding', 'vocab', 'myth', 'shortcut', 'quote'];
    if (!validTypes.includes(type)) {
      throw new ApiError(400, "Invalid question type");
    }
    updateData.type = type;
  }
  if (question !== undefined) updateData.question = String(question).trim();
  if (answer !== undefined) updateData.answer = String(answer).trim();
  if (active !== undefined) updateData.active = Boolean(active);
  if (tags !== undefined) {
    updateData.tags = Array.isArray(tags) ? tags.filter(t => typeof t === "string").map(t => t.trim()) : [];
  }
  if (difficulty !== undefined) {
    if (!["easy", "medium", "hard"].includes(difficulty)) {
      throw new ApiError(400, "Invalid difficulty");
    }
    updateData.difficulty = difficulty;
  }

  const updated = await MaintenanceQuestion.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updated) {
    throw new ApiError(404, 'Question not found');
  }

  res.status(200).json(
    new ApiResponse(200, updated, 'Question updated')
  );
});

// @desc    Delete question
// @route   DELETE /api/maintenance/:id
export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await MaintenanceQuestion.findByIdAndDelete(req.params.id);
  
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Question deleted')
  );
});
