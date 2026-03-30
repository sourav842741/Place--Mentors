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
      state.user = action.payload;
      state.isAuth = true;
      state.loading = false;
    },

    logoutUser: (state) => {
      state.user = null;
      state.isAuth = false;
      state.loading = false;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setUserData, logoutUser, setLoading } = userSlice.actions;
export default userSlice.reducer;