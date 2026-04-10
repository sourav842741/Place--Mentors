import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { toast } from 'sonner';

export const generateYoutubeSummary = createAsyncThunk(
  'youtube/generateSummary',
  async (url, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const credits = state.user.user?.credits || 0;
      
      if (credits < 1) {
        toast.error("No credits left!");
        return rejectWithValue("No credits");
      }

      const response = await api.post('/api/ai/youtube-summary', { url });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate summary';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const youtubeSlice = createSlice({
  name: 'youtube',
  initialState: {
    loading: false,
    data: null, // {title, thumbnail, duration, videoId, summary: {english, hindi}, timestamps:[], highlights:[]}
    error: null,
    creditsLeft: null
  },
  reducers: {
    clearSummary: (state) => {
      state.data = null;
      state.error = null;
      state.creditsLeft = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateYoutubeSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateYoutubeSummary.fulfilled, (state, action) => {
        console.log("✅ YOUTUBE FULFILLED - Raw payload:", action.payload);
        console.log("✅ Extracted data:", action.payload.data);
        console.log("✅ Credits left from API:", action.payload.data?.creditsLeft || action.payload.creditsLeft);
        
        state.loading = false;
        state.data = action.payload.data.data; // 🔥 FIX (actual data)
state.creditsLeft = action.payload.data.creditsLeft; 
        state.apiResponse = action.payload; // Backup full response
        
        toast.success("Pro Summary generated! ✨");
        console.log("✅ Final state - creditsLeft:", state.creditsLeft);
      })
      .addCase(generateYoutubeSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSummary } = youtubeSlice.actions;
export default youtubeSlice.reducer;

