import { io } from "socket.io-client";
import store from "./redux/store";

import {
  battleStart,
  battleWinner,
  battleDraw,
  updateOpponentCode,
} from "./redux/battleSlice";

import {
  updateFriendRequests,
  updateFriends,
  updateChallenges,
} from "./redux/userSlice";

// SOCKET INIT
export const socket = io("https://place-mentor-x5d5.onrender.com", {
  withCredentials: true,
  autoConnect: true,
});

// CONNECTION
socket.on("connect", () => {
  console.log("🔥 Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

// FRIEND EVENTS
socket.on("friend_request_received", (data) => {
  store.dispatch(
    updateFriendRequests({
      sent: store.getState().user.friendRequests.sent,
      received: [
        ...(store.getState().user.friendRequests.received || []),
        data.requester,
      ],
    }),
  );
});

socket.on("challenge_received", (data) => {
  console.log("🔥 SOCKET DATA:", data);
  store.dispatch(
    updateChallenges({
      sent: store.getState().user.challenges.sent,
      received: [...(store.getState().user.challenges.received || []), data],
    }),
  );
});

socket.on("friend_request_accepted", (data) => {
  store.dispatch(
    updateFriends([...(store.getState().user.friends || []), data.friend]),
  );
});

// BATTLE EVENTS
socket.on("battle:start", (data) => {
  store.dispatch(battleStart(data));
});

socket.on("battle:winner", (data) => {
  store.dispatch(battleWinner(data));
});

socket.on("battle:draw", () => {
  store.dispatch(battleDraw());
});

socket.on("opponent_code_change", (data) => {
  store.dispatch(updateOpponentCode(data));
});

socket.on("battle:data", (data) => {
  store.dispatch(battleStart({ ...data, timeLimit: data.timeLimit || 900 }));
});

// 🔥 NEW: Challenge Rejected Handler
socket.on("challenge:rejected", ({ challengerId, challengedId }) => {
  console.log("🎯 Challenge rejected update:", { challengerId, challengedId });
  const state = store.getState().user;

  // Filter out the rejected challenge
  // If I'm challenged (received), remove this challenger
  // If I'm challenger (sent), remove this challenged
  const updatedReceived = state.challenges.received.filter(
    (c) => c._id !== challengerId, // remove if this challenger sent to me
  );

  const updatedSent = state.challenges.sent.filter(
    (c) => c._id !== challengedId, // remove if I challenged this person
  );

  store.dispatch(
    updateChallenges({
      sent: updatedSent,
      received: updatedReceived,
    }),
  );

  console.log("✅ Challenges state updated");
});

export default socket;
