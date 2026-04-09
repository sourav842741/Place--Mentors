import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
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
  },
});

export const { setUserData, logoutUser, setLoading, updateCredits} = userSlice.actions;
export default userSlice.reducer;
