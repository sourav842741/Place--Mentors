import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { banUser as banUserApi, unbanUser as unbanUserApi } from "../services/api";

/* ===============================
   FETCH USERS
================================= */
export const fetchAdminUsers = createAsyncThunk(
  "adminUsers/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admin/users");
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch users"
      );
    }
  }
);

/* ===============================
   PROMOTE USER
================================= */
export const promoteUser = createAsyncThunk(
  "adminUsers/promoteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/promote/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to promote user"
      );
    }
  }
);

/* ===============================
   DEMOTE USER
================================= */
export const demoteUser = createAsyncThunk(
  "adminUsers/demoteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/demote/${userId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to demote user"
      );
    }
  }
);

/* ===============================
   ADJUST USER CREDITS
================================= */
export const adjustUserCredits = createAsyncThunk(
  "adminUsers/adjustUserCredits",
  async ({ userId, amount, type }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/users/${userId}/credits`, {
        amount,
        type,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to adjust credits"
      );
    }
  }
);

/* ===============================
   BAN USER
================================= */
export const banUser = createAsyncThunk(
  "adminUsers/banUser",
  async ({ userId, banReason }, { rejectWithValue }) => {
    try {
      const response = await banUserApi(userId, banReason);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to ban user"
      );
    }
  }
);

/* ===============================
   UNBAN USER
================================= */
export const unbanUser = createAsyncThunk(
  "adminUsers/unbanUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await unbanUserApi(userId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to unban user"
      );
    }
  }
);

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const adminUserSlice = createSlice({
  name: "adminUsers",
  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // SOCKET REAL-TIME UPDATES
    setUserOnline: (state, action) => {
      const userId = action.payload._id;
      const userIndex = state.data.findIndex(u => u._id === userId);
      if (userIndex !== -1) {
        state.data[userIndex].isOnline = true;
      }
    },
    setUserOffline: (state, action) => {
      const userId = action.payload._id || action.payload;
      const userIndex = state.data.findIndex(u => u._id === userId);
      if (userIndex !== -1) {
        state.data[userIndex].isOnline = false;
        state.data[userIndex].lastSeen = action.payload.lastSeen || new Date();
      }
    },
    updateUserFromSocket: (state, action) => {
      const updatedUser = action.payload;
      const userIndex = state.data.findIndex(u => u._id === updatedUser._id);
      if (userIndex !== -1) {
        state.data[userIndex] = { ...state.data[userIndex], ...updatedUser };
      }
    },
  },

  extraReducers: (builder) => {
    builder

      /* FETCH */
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* PROMOTE */
      .addCase(promoteUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        state.data = state.data.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        );
      })

      /* DEMOTE */
      .addCase(demoteUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        state.data = state.data.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        );
      })

      /* ADJUST CREDITS */
      .addCase(adjustUserCredits.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        state.data = state.data.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        );
      })

      /* BAN */
      .addCase(banUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        state.data = state.data.map((user) =>
          user._id === updatedUser._id
            ? { ...updatedUser, isBanned: true }
            : user
        );
      })

      /* UNBAN */
      .addCase(unbanUser.fulfilled, (state, action) => {
        const updatedUser = action.payload;

        state.data = state.data.map((user) =>
          user._id === updatedUser._id
            ? { ...updatedUser, isBanned: false }
            : user
        );
      });
  },
});



export const {
  clearError,
  setUserOnline,
  setUserOffline,
  updateUserFromSocket,
} = adminUserSlice.actions;

export default adminUserSlice.reducer;

