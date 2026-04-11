import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getStreak } from '../services/api.js';

const initialState = {
  data: {
    currentStreak: 0,
    bestStreak: 0,
    completedDays: [],
    todaySolved: false,
    remainingTime: '00:00:00'
  },
  loading: false,
  error: null
};

export const fetchStreak = createAsyncThunk(
  'streak/fetchStreak',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getStreak();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch streak');
    }
  }
);

const streakSlice = createSlice({
  name: 'streak',
  initialState,
  reducers: {
    updateRemainingTime: (state, action) => {
      state.data.remainingTime = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStreak.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStreak.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStreak.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateRemainingTime } = streakSlice.actions;
export default streakSlice.reducer;

