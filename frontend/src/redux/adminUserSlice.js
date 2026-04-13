import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchAdminUsers = createAsyncThunk(
  'adminUsers/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/admin/users');
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const promoteUser = createAsyncThunk(
  'adminUsers/promoteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/admin/promote/${userId}`);
      return response.data.data; // updated user
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to promote user'
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
  name: 'adminUsers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(promoteUser.fulfilled, (state, action) => {
  const updatedUser = action.payload;

  state.data = state.data.map((user) =>
    user._id === updatedUser._id ? updatedUser : user
  );
});
  },
});

export const { clearError } = adminUserSlice.actions;
export default adminUserSlice.reducer;
