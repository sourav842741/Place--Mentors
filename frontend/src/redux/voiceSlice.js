import { createSlice, createAsyncThunk, createEntityAdapter } from "@reduxjs/toolkit";
import { startVoiceCall, getVoiceHistory, getVoiceReport } from "../services/voiceApi.js";
import { toast } from "sonner";

// Entity adapter for normalized history
export const voiceHistoryAdapter = createEntityAdapter({
  selectId: (call) => call._id,
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
});

const initialState = voiceHistoryAdapter.getInitialState({
  loading: false,
  currentCall: null,
  reportLoading: false,
  error: null
});

// Async Thunks
export const startVoiceCallAsync = createAsyncThunk(
  "voice/startCall",
  async ({ phone, mode }, { rejectWithValue }) => {
    try {
      const response = await startVoiceCall({ phone, mode });
      toast.success("✅ Call initiated! Check your phone.");
      return response.data.data;
    } catch (error) {
      toast.error("Failed to start call");
      return rejectWithValue(error.response?.data?.message || "Failed to start call");
    }
  }
);

export const fetchVoiceHistory = createAsyncThunk(
  "voice/fetchHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getVoiceHistory();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch history");
    }
  }
);

export const fetchVoiceReport = createAsyncThunk(
  "voice/fetchReport",
  async (callId, { rejectWithValue }) => {
    try {
      const response = await getVoiceReport(callId);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch report");
    }
  }
);

const voiceSlice = createSlice({
  name: "voice",
  initialState,
  reducers: {
    setCurrentCall: (state, action) => {
      state.currentCall = action.payload;
    },
    clearCurrentCall: (state) => {
      state.currentCall = null;
    },
    updateCallStatus: (state, action) => {
      const { callId, status, duration } = action.payload;
      const call = state.entities[callId];
      if (call) {
        call.status = status;
        if (duration) call.duration = duration;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // History
      .addCase(fetchVoiceHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVoiceHistory.fulfilled, (state, action) => {
        state.loading = false;
        voiceHistoryAdapter.setAll(state, action.payload);
      })
      .addCase(fetchVoiceHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Report
      .addCase(fetchVoiceReport.pending, (state) => {
        state.reportLoading = true;
      })
      .addCase(fetchVoiceReport.fulfilled, (state, action) => {
        state.reportLoading = false;
        state.currentCall = action.payload;
      })
      .addCase(fetchVoiceReport.rejected, (state, action) => {
        state.reportLoading = false;
        state.error = action.payload;
      })
      // Start call
      .addCase(startVoiceCallAsync.fulfilled, (state, action) => {
        // Add to history
        voiceHistoryAdapter.upsertOne(state, action.payload);
      });
  }
});

export const { setCurrentCall, clearCurrentCall, updateCallStatus } = voiceSlice.actions;
export default voiceSlice.reducer;

