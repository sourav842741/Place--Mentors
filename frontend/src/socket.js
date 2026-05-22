import { io } from "socket.io-client";
import { toast } from "sonner";
import store from "./redux/store";

import { battleStart, battleWinner, battleDraw, updateOpponentCode } from "./redux/battleSlice";

import {
  updateFriendRequests,
  updateFriends,
  updateChallenges,
  logoutUser,
} from "./redux/userSlice";

import { setMaintenanceState } from "./redux/maintenanceSlice";

// ================= SERVER URL =================
const SERVER_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://place-mentor-x5d5.onrender.com";

// ================= SOCKET INIT =================
export const socket = io(SERVER_URL, {
  withCredentials: true,

  // IMPORTANT:
  // Connect only AFTER login/me success
  autoConnect: false,

  transports: ["polling", "websocket"],

  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,

  timeout: 20000,
});

// ================= CONNECTION EVENTS =================
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connect_error:", err?.message || err);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});

// ================= FRIEND EVENTS =================
socket.on("friend_request_received", (data) => {
  const state = store.getState();

  store.dispatch(
    updateFriendRequests({
      sent: state.user.friendRequests.sent,
      received: [...(state.user.friendRequests.received || []), data.requester],
    })
  );
});

socket.on("friend_request_accepted", (data) => {
  const state = store.getState();

  store.dispatch(updateFriends([...(state.user.friends || []), data.friend]));
});

// ================= CHALLENGE EVENTS =================
socket.on("challenge_received", (data) => {
  console.log("🎯 Challenge received:", data);

  const state = store.getState();

  store.dispatch(
    updateChallenges({
      sent: state.user.challenges.sent,
      received: [...(state.user.challenges.received || []), data],
    })
  );
});

// ================= CHALLENGE REJECTED =================
socket.on("challenge:rejected", ({ challengerId, challengedId }) => {
  console.log("🎯 Challenge rejected update:", {
    challengerId,
    challengedId,
  });

  const state = store.getState().user;

  const updatedReceived = state.challenges.received.filter((c) => c._id !== challengerId);

  const updatedSent = state.challenges.sent.filter((c) => c._id !== challengedId);

  store.dispatch(
    updateChallenges({
      sent: updatedSent,
      received: updatedReceived,
    })
  );

  console.log("✅ Challenges state updated");
});

// ================= BATTLE EVENTS =================
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
  store.dispatch(
    battleStart({
      ...data,
      timeLimit: data.timeLimit || 900,
    })
  );
});

// ================= ADMIN EVENTS =================
socket.on("admin:user:online", (userData) => {
  store.dispatch({
    type: "adminUsers/setUserOnline",
    payload: userData,
  });
});

socket.on("admin:user:offline", (userData) => {
  store.dispatch({
    type: "adminUsers/setUserOffline",
    payload: userData,
  });
});

socket.on("admin:user:updated", (updatedUser) => {
  store.dispatch({
    type: "adminUsers/updateUserFromSocket",
    payload: {
      ...updatedUser,
      isSuperAdmin: updatedUser.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL,
    },
  });
});

// ================= TICKET EVENTS =================
socket.on("ticket:updated", (data) => {
  store.dispatch({
    type: "tickets/updateTicketFromSocket",
    payload: data,
  });
});

socket.on("ticket:deleted", (data) => {
  store.dispatch({
    type: "tickets/removeTicketFromSocket",
    payload: data,
  });
});

// ================= MAINTENANCE EVENTS =================
socket.on("maintenance_updated", (data) => {
  store.dispatch(setMaintenanceState(data));
});

// ================= USER BANNED =================
socket.on("user:banned", (data) => {
  const reason = data?.reason || "Your account has been suspended.";

  toast.error(`Account Banned: ${reason}`, {
    duration: 10000,
  });

  // Disconnect socket immediately
  socket.disconnect();

  // Logout redux state
  store.dispatch(logoutUser());

  // Redirect
  window.location.href = "/login";
});

// ================= USER UNBANNED =================
socket.on("user:unbanned", (data) => {
  const message = data?.message || "Your account has been restored.";

  toast.success(message, {
    duration: 8000,
  });
});

// ================= SAFE CONNECT FUNCTION =================
export const connectSocket = (userId) => {
  try {
    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join", userId);

    console.log("✅ Socket join emitted:", userId);
  } catch (error) {
    console.error("❌ Socket connect error:", error);
  }
};

// ================= SAFE DISCONNECT FUNCTION =================
export const disconnectSocket = () => {
  try {
    if (socket.connected) {
      socket.disconnect();
    }

    console.log("✅ Socket disconnected safely");
  } catch (error) {
    console.error("❌ Socket disconnect error:", error);
  }
};

export default socket;
