import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

//  SEND FRIEND REQUEST

const sendFriendRequest = asyncHandler(async (req, res) => {
  const { id: friendId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (userId.toString() === friendId) {
    throw new ApiError(400, "Cannot send friend request to yourself");
  }

  const user = await User.findById(userId).select("friends friendRequests");

  const friend = await User.findById(friendId).select(
    "fullName avatar xp level streakCount friendRequests socketId",
  );

  if (!user || !friend) {
    throw new ApiError(404, "User not found");
  }

  //  ensure structure exists
  if (!user.friendRequests) {
    user.friendRequests = { sent: [], received: [] };
  }
  if (!friend.friendRequests) {
    friend.friendRequests = { sent: [], received: [] };
  }

  //  already friends check
  if (user.friends.some((f) => f.toString() === friendId)) {
    throw new ApiError(400, "Already friends");
  }

  //  already sent check
  if (user.friendRequests.sent.some((r) => r.toString() === friendId)) {
    throw new ApiError(400, "Friend request already sent");
  }

  //  push safe
  user.friendRequests.sent.push(friendId);
  friend.friendRequests.received.push(userId);

  await user.save();
  await friend.save();

  //  socket
  const io = req.app.get("io");
  if (friend.socketId && io) {
    io.to(friend.socketId).emit("friend_request_received", {
      requester: {
        _id: user._id,
        fullName: user.fullName,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        streakCount: user.streakCount,
      },
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        friend: {
          _id: friend._id,
          fullName: friend.fullName,
          avatar: friend.avatar,
          xp: friend.xp,
          level: friend.level,
          streakCount: friend.streakCount,
        },
      },
      "Friend request sent",
    ),
  );
});

//  ACCEPT REQUEST

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { id: requesterId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(requesterId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId).select("friends friendRequests");

  const requester = await User.findById(requesterId).select(
    "friends friendRequests socketId fullName avatar xp level streakCount",
  );

  if (!user || !requester) {
    throw new ApiError(404, "User not found");
  }

  //  ensure structure
  if (!user.friendRequests) {
    user.friendRequests = { sent: [], received: [] };
  }
  if (!requester.friendRequests) {
    requester.friendRequests = { sent: [], received: [] };
  }

  //  check request
  const index = user.friendRequests.received.findIndex(
    (r) => r.toString() === requesterId,
  );

  if (index === -1) {
    throw new ApiError(400, "No pending request");
  }

  // remove request
  user.friendRequests.received.splice(index, 1);

  requester.friendRequests.sent = requester.friendRequests.sent.filter(
    (r) => r.toString() !== userId.toString(),
  );

  // add friends
  user.friends.push(requesterId);
  requester.friends.push(userId);

  await user.save();
  await requester.save();

  // socket
  const io = req.app.get("io");
  if (requester.socketId && io) {
    io.to(requester.socketId).emit("friend_request_accepted", {
      friend: {
        _id: user._id,
        fullName: user.fullName,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        streakCount: user.streakCount,
      },
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        friend: {
          _id: requester._id,
          fullName: requester.fullName,
          avatar: requester.avatar,
          xp: requester.xp,
          level: requester.level,
          streakCount: requester.streakCount,
        },
      },
      "Friend request accepted",
    ),
  );
});

//  REJECT REQUEST

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { id: requesterId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId).select("friendRequests");

  const requester = await User.findById(requesterId).select("friendRequests");

  if (!user || !requester) {
    throw new ApiError(404, "User not found");
  }

  if (!user.friendRequests) {
    user.friendRequests = { sent: [], received: [] };
  }

  // remove received
  user.friendRequests.received = user.friendRequests.received.filter(
    (r) => r.toString() !== requesterId,
  );

  // remove sender side
  requester.friendRequests.sent = requester.friendRequests.sent.filter(
    (r) => r.toString() !== userId.toString(),
  );

  await user.save();
  await requester.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Friend request rejected"));
});

//  SEND CHALLENGE

const sendChallenge = asyncHandler(async (req, res) => {
  const { id: challengedId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId).select(
    "friends challenges fullName avatar xp level",
  );
  const challenged = await User.findById(challengedId).select(
    "challenges fullName avatar xp level socketId",
  );

  if (!user || !challenged) throw new ApiError(404, "User not found");

  if (!user.challenges) user.challenges = { sent: [], received: [] };
  if (!challenged.challenges)
    challenged.challenges = { sent: [], received: [] };

  // must be friends
  if (!user.friends.some((f) => f.toString() === challengedId)) {
    throw new ApiError(400, "Must be friends");
  }

  // already sent
  if (user.challenges.sent.includes(challengedId)) {
    throw new ApiError(400, "Already challenged");
  }

  user.challenges.sent.push(challengedId);
  challenged.challenges.received.push(userId);

  await user.save();
  await challenged.save();

  const io = req.io;

  const challengerData = {
    _id: user._id,
    fullName: user.fullName,
    avatar: user.avatar,
    xp: user.xp,
    level: user.level,
  };

  // Primary: Room emit
  io.to(challengedId.toString()).emit("challenge_received", challengerData);

  // Fallback: Direct socketId
  if (challenged.socketId) {
    io.to(challenged.socketId).emit("challenge_received", challengerData);
  }

  return res.status(200).json(new ApiResponse(200, {}, "Challenge sent"));
});

//  REJECT CHALLENGE

const rejectChallenge = asyncHandler(async (req, res) => {
  const { id: challengerId } = req.params;
  const userId = req.user._id;

  const user = await User.findById(userId).select("challenges");

  const challenger = await User.findById(challengerId).select("challenges");

  if (!user || !challenger) {
    throw new ApiError(404, "User not found");
  }

  if (!user.challenges) {
    user.challenges = { sent: [], received: [] };
  }

  // remove received
  user.challenges.received = user.challenges.received.filter(
    (r) => r.toString() !== challengerId,
  );

  // remove sender side
  challenger.challenges.sent = challenger.challenges.sent.filter(
    (r) => r.toString() !== userId.toString(),
  );

  await user.save();
  await challenger.save();

  return res.status(200).json(new ApiResponse(200, {}, "Challenge rejected"));
});

//  GET FRIENDS

const getFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId)
    .select("friends friendRequests challenges")
    .populate("friends", "fullName avatar xp level streakCount")
    .populate("friendRequests.sent", "fullName avatar xp level streakCount")
    .populate("friendRequests.received", "fullName avatar xp level streakCount")
    .populate("challenges.sent", "fullName avatar xp level streakCount")
    .populate("challenges.received", "fullName avatar xp level streakCount")
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        friends: user?.friends || [],
        friendRequests: {
          sent: user?.friendRequests?.sent || [],
          received: user?.friendRequests?.received || [],
        },
        challenges: {
          sent: user?.challenges?.sent || [],
          received: user?.challenges?.received || [],
        },
        suggestedUsers: [],
      },
      "Friends data",
    ),
  );
});

export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  sendChallenge,
  rejectChallenge,
  getFriends,
};
