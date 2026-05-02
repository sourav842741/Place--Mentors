import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

/* ===============================
   THUNKS
=============================== */

export const fetchEmailStats = createAsyncThunk(
  "emailAdmin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/api/admin/email/stats");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

export const fetchEmailLogs = createAsyncThunk(
  "emailAdmin/fetchLogs",
  async ({ page = 1, limit = 50, filters = {} } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...filters,
      });

      const res = await api.get(`/api/admin/email/logs?${params}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch logs");
    }
  }
);

export const sendSingleEmail = createAsyncThunk(
  "emailAdmin/sendSingle",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/admin/email/send-single", data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send email");
    }
  }
);

export const sendBulkEmail = createAsyncThunk(
  "emailAdmin/sendBulk",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/admin/email/send-bulk", data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed bulk send");
    }
  }
);

export const testTemplate = createAsyncThunk(
  "emailAdmin/testTemplate",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/api/admin/email/test-template", data);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Test failed");
    }
  }
);

/* ===============================
   SLICE
=============================== */

const emailAdminSlice = createSlice({
  name: "emailAdmin",

  initialState: {
    stats: null,
    logs: { logs: [], pagination: {} },
    loading: false,
    sending: false,
    error: null,
    sendResult: null,
  },

  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    clearSendResult: (state) => {
      state.sendResult = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- STATS ---------- */

      .addCase(fetchEmailStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchEmailStats.fulfilled, (state, action) => {
        state.loading = false;

        // FIXED
        state.stats = action.payload.data;
      })

      .addCase(fetchEmailStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- LOGS ---------- */

      .addCase(fetchEmailLogs.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchEmailLogs.fulfilled, (state, action) => {
        state.loading = false;

        // FIXED
        state.logs = action.payload.data;
      })

      .addCase(fetchEmailLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- SEND SINGLE ---------- */

      .addCase(sendSingleEmail.pending, (state) => {
        state.sending = true;
        state.error = null;
      })

      .addCase(sendSingleEmail.fulfilled, (state, action) => {
        state.sending = false;
        state.sendResult = action.payload;
      })

      .addCase(sendSingleEmail.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      /* ---------- SEND BULK ---------- */

      .addCase(sendBulkEmail.pending, (state) => {
        state.sending = true;
        state.error = null;
      })

      .addCase(sendBulkEmail.fulfilled, (state, action) => {
        state.sending = false;
        state.sendResult = action.payload;
      })

      .addCase(sendBulkEmail.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      /* ---------- TEST TEMPLATE ---------- */

      .addCase(testTemplate.pending, (state) => {
        state.sending = true;
      })

      .addCase(testTemplate.fulfilled, (state, action) => {
        state.sending = false;
        state.sendResult = action.payload;
      })

      .addCase(testTemplate.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSendResult } = emailAdminSlice.actions;

export default emailAdminSlice.reducer;
