import Session from "../models/session.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getSessions = async (req, res) => {
  // req.userId is set by isAuth
  const userId = req.userId;

  const sessions = await Session.find({ userId }).sort({ isCurrent: -1, loginTime: -1 }).lean();

  return res.status(200).json(new ApiResponse(200, { sessions }, "Active sessions fetched"));
};

export const deleteSession = async (req, res) => {
  const userId = req.userId;
  const { sessionId } = req.params;

  if (!sessionId) {
    throw new ApiError(400, "sessionId is required");
  }

  const session = await Session.findOne({ userId, sessionId });
  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  await Session.deleteOne({ userId, sessionId });

  return res.status(200).json(new ApiResponse(200, null, "Device logged out"));
};

export const logoutAll = async (req, res) => {
  const userId = req.userId;
  const currentSessionId = req.sessionId;

  if (!currentSessionId) {
    throw new ApiError(401, "Unauthorized: current session missing");
  }

  await Session.deleteMany({ userId, sessionId: { $ne: currentSessionId } });

  return res.status(200).json(new ApiResponse(200, null, "Logged out all other devices"));
};
