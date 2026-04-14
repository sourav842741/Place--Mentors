import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

// ============================
//  GET DISCOVER USERS
// ============================
const getDiscoverUsers = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  //  current user
  const user = await User.findById(userId).select(
    "friends friendRequests.sent"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //  exclude ids (friends + sent requests + self)
  const excludeIds = [
    userId.toString(),
    ...user.friends.map((f) => f.toString()),
    ...user.friendRequests.sent.map((r) => r.toString()),
  ];

  //  find users
  const discoverUsers = await User.find({
    _id: { $nin: excludeIds },
  })
    .select("fullName avatar xp level streakCount")
    .limit(20)
    .lean();

  //  SAFE RESPONSE (IMPORTANT FIX)
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: discoverUsers || [], // never undefined
      },
      "Discover users"
    )
  );
});

export { getDiscoverUsers };