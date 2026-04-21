import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import CallHistory from "../models/CallHistory.model.js";
import videosdkService from "../services/videosdk.service.js";

const startCall = asyncHandler(async (req, res) => {
  const { phone, mode } = req.body;
  const userId = req.user._id;

  if (!phone?.match(/^\+?[1-9]\d{1,14}$/)) {
    throw new ApiError(400, "Valid phone number required");
  }

  if (
    ![
      "hr-interview",
      "spoken-english",
      "motivation",
      "resume-screening",
    ].includes(mode)
  ) {
    throw new ApiError(400, "Invalid call mode");
  }

  // Single Call Logic (VideoSDK only)
  const meetingData = await videosdkService(phone);

  // Save DB Record
  const callRecord = await CallHistory.create({
    userId,
    phone,
    mode,
    videosdkMeetingId: meetingData?.id || null,
    status: "active",
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        callId: callRecord._id,
        videosdkData: meetingData,
        phone,
        mode,
      },
      "Call initiated successfully"
    )
  );
});

const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const history = await CallHistory.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("-__v")
    .lean();

  res.status(200).json(
    new ApiResponse(200, history, "Call history fetched")
  );
});

const getReport = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;

  const report = await CallHistory.findOne({
    _id: id,
    userId,
  })
    .select("-__v -userId")
    .lean();

  if (!report) {
    throw new ApiError(404, "Call report not found");
  }

  res.status(200).json(
    new ApiResponse(200, report, "Call report fetched")
  );
});

const webhook = asyncHandler(async (req, res) => {
  const { callId, status, duration } = req.body;

  if (callId) {
    const callRecord = await CallHistory.findById(callId);

    if (callRecord) {
      if (status) callRecord.status = status;
      if (duration) callRecord.duration = parseInt(duration);

      await callRecord.save();

      const io = req.io;

      if (io && callRecord.userId) {
        io.to(callRecord.userId.toString()).emit(
          "voice_call_update",
          {
            callId: callRecord._id,
            status: callRecord.status,
            duration: callRecord.duration,
          }
        );
      }
    }
  }

  res.status(200).send("OK");
});

const updateStatus = asyncHandler(async (req, res) => {
  const {
    callId,
    status,
    score,
    transcript,
    feedback,
  } = req.body;

  const userId = req.user._id;

  const callRecord = await CallHistory.findOne({
    _id: callId,
    userId,
  });

  if (!callRecord) {
    throw new ApiError(404, "Call not found");
  }

  if (status) callRecord.status = status;
  if (score !== undefined) callRecord.score = score;
  if (transcript) callRecord.transcript = transcript;
  if (feedback) callRecord.feedback = feedback;

  await callRecord.save();

  res.status(200).json(
    new ApiResponse(200, callRecord, "Status updated")
  );
});

export {
  startCall,
  getHistory,
  getReport,
  webhook,
  updateStatus,
};