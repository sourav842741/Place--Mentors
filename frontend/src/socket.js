
import { io } from "socket.io-client";
import { toast } from "sonner";
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
  logoutUser,
} from "./redux/userSlice";

import { setMaintenanceState } from "./redux/maintenanceSlice";

const SOCKET_URL =
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://place-mentor-x5d5.onrender.com");

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, // old logic preserved
  transports: ["websocket", "polling"],
  auth: {
    token: localStorage.getItem("token") || undefined,
  },
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 20000,
});

/* ✅ SAFE CONNECT HELPER */
export const connectSocketSafely = () => {
  socket.auth = {
    token: localStorage.getItem("token") || undefined,
  };

  if (!socket.connected) {
    socket.connect();
  }
};

/* CONNECTION */
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);

  const user = store.getState().user.user;

  if (user?._id) {
    socket.emit("join", user._id);
  }

  if (user?.role === "admin" || user?.isSuperAdmin) {
    socket.emit("admin:presence:init");
  }
});

socket.on("disconnect", () => {
  console.log("❌ Socket disconnected");
});

socket.on("connect_error", (err) => {
  console.log("Socket connect error:", err?.message);
});

/* FRIEND EVENTS */
socket.on("friend_request_received", (data) => {
  store.dispatch(
    updateFriendRequests({
      sent: store.getState().user.friendRequests.sent,
      received: [
        ...(store.getState().user.friendRequests.received || []),
        data.requester,
      ],
    })
  );
});

socket.on("challenge_received", (data) => {
  store.dispatch(
    updateChallenges({
      sent: store.getState().user.challenges.sent,
      received: [...(store.getState().user.challenges.received || []), data],
    })
  );
});

socket.on("friend_request_accepted", (data) => {
  store.dispatch(
    updateFriends([...(store.getState().user.friends || []), data.friend])
  );
});

/* BATTLE */
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

/* CHALLENGE REJECT */
socket.on("challenge:rejected", ({ challengerId, challengedId }) => {
  const state = store.getState().user;

  const updatedReceived = state.challenges.received.filter(
    (c) => c._id !== challengerId
  );

  const updatedSent = state.challenges.sent.filter(
    (c) => c._id !== challengedId
  );

  store.dispatch(
    updateChallenges({
      sent: updatedSent,
      received: updatedReceived,
    })
  );
});

/* ADMIN REALTIME */
socket.on("admin:presence:list", (onlineIds) => {
 

  store.dispatch({
    type: "adminUsers/setPresenceList",
    payload: onlineIds,
  });
});

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
      isSuperAdmin:
        updatedUser.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL,
    },
  });
});

/* TICKETS */
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

/* MAINTENANCE */
socket.on("maintenance_updated", (data) => {
  store.dispatch(setMaintenanceState(data));
});

/* USER BANNED */
socket.on("user:banned", (data) => {
  const reason = data?.reason || "Your account has been suspended.";

  toast.error(`Account Banned: ${reason}`, {
    duration: 10000,
  });

  localStorage.removeItem("token");
  store.dispatch(logoutUser());

  window.location.href = "/login";
});

/* USER UNBANNED */
socket.on("user:unbanned", (data) => {
  toast.success(
    data?.message || "Your account has been restored.",
    { duration: 8000 }
  );
});

export default socket;