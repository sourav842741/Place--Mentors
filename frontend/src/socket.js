import { io } from "socket.io-client";
import  store  from './redux/store';
import { updateFriendRequests, updateFriends } from './redux/userSlice';

export const socket = io("http://localhost:5000", {
  withCredentials: true,
  autoConnect: true,
});

// Friend system real-time updates
socket.on("friend_request_received", (data) => {
  store.dispatch(updateFriendRequests({
    sent: store.getState().user.friendRequests.sent,
    received: [...(store.getState().user.friendRequests.received || []), data.requester]
  }));
});

socket.on("friend_request_accepted", (data) => {
  store.dispatch(updateFriends([...(store.getState().user.friends || []), data.friend]));
  store.dispatch(updateFriendRequests({
    sent: (store.getState().user.friendRequests.sent || []).filter(req => req._id !== data.friend._id),
    received: store.getState().user.friendRequests.received || []
  }));
});

export default socket;

