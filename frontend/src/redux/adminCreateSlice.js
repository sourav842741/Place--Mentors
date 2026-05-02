import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const createManualPotd = createAsyncThunk(
  'adminCreate/createPotd',
  async (potdData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/admin/manual-potd', potdData);

      console.log(' POTD RESPONSE:', response.data);

      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create POTD');
    }
  }
);

// =========================
// 🔥 CREATE CPOTD
// =========================
export const createManualCpotd = createAsyncThunk(
  'adminCreate/createCpotd',
  async (cpotdData, { rejectWithValue }) => {
    try {
      console.log('🚀 CPOTD API CALL START');
      console.log('📦 Payload:', cpotdData);

      const response = await api.post('/api/admin/manual-cpotd', cpotdData); // ✅ FIXED

      console.log('✅ CPOTD RESPONSE:', response.data);

      return response.data.data; // ✅ IMPORTANT
    } catch (error) {
      console.error('❌ CPOTD ERROR FULL:', error);
      console.error('❌ CPOTD ERROR RESPONSE:', error.response?.data);

      return rejectWithValue(error.response?.data?.message || 'Failed to create CPOTD');
    }
  }
);

// =========================
// 🔥 INITIAL STATE
// =========================
const initialState = {
  loading: false,
  error: null,
  success: null,
};

// =========================
// 🔥 SLICE
// =========================
const adminCreateSlice = createSlice({
  name: 'adminCreate',
  initialState,
  reducers: {
    clearError: (state) => {
      console.log('🧹 CLEAR ERROR');
      state.error = null;
    },
    clearSuccess: (state) => {
      console.log('🧹 CLEAR SUCCESS');
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // =========================
      // POTD
      // =========================
      .addCase(createManualPotd.pending, (state) => {
        console.log('⏳ POTD LOADING...');
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createManualPotd.fulfilled, (state, action) => {
        console.log('🎉 POTD SUCCESS:', action.payload);
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(createManualPotd.rejected, (state, action) => {
        console.log('💥 POTD FAILED:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })

      // =========================
      // CPOTD
      // =========================
      .addCase(createManualCpotd.pending, (state) => {
        console.log('⏳ CPOTD LOADING...');
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(createManualCpotd.fulfilled, (state, action) => {
        console.log('🎉 CPOTD SUCCESS:', action.payload);
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(createManualCpotd.rejected, (state, action) => {
        console.log('💥 CPOTD FAILED:', action.payload);
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// =========================
// EXPORTS
// =========================
export const { clearError, clearSuccess } = adminCreateSlice.actions;
export default adminCreateSlice.reducer;
