import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  friends: [],
  friendRequests: {
    sent: [],
    received: [],
  },
  challenges: {
    sent: [],
    received: [],
  },
  isAuth: false,
  loading: true,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload || null;
      state.isAuth = !!action.payload;
      state.loading = false;
    },

    logoutUser: (state) => {
      state.user = null;
      state.isAuth = false;
      state.loading = false;
    },

    setLoading: (state, action) => {
      if (typeof action.payload === "boolean") {
        state.loading = action.payload;
      }
    },

    updateCredits: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          credits: action.payload,
        };
      }
    },

    loadFriends: (state, action) => {
      state.friends = action.payload.friends || [];
      state.friendRequests = action.payload.friendRequests || {
        sent: [],
        received: [],
      };
    },

    updateFriendRequests: (state, action) => {
      state.friendRequests = action.payload;
    },

    updateFriends: (state, action) => {
      state.friends = action.payload;
    },
    updateChallenges: (state, action) => {
      state.challenges = action.payload;
    },
  },
});

export const {
  setUserData,
  logoutUser,
  setLoading,
  updateCredits,
  loadFriends,
  updateFriendRequests,
  updateFriends,
  updateChallenges,
} = userSlice.actions;
export default userSlice.reducer;
