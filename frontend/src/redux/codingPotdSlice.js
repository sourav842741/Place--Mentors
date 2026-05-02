import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCpotdApi, submitCpotdApi } from '../services/cpotdApi';

//  Fetch CPOTD
export const fetchCpotd = createAsyncThunk('cpotd/fetch', async (_, { rejectWithValue }) => {
  try {
    return await fetchCpotdApi();
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

//  Submit Code
export const submitCpotdCode = createAsyncThunk(
  'cpotd/submit',
  async (data, { rejectWithValue }) => {
    try {
      return await submitCpotdApi(data);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 🔥 Initial State
const initialState = {
  questions: [],
  currentQuestionIndex: 0,
  executionResults: [],
  submissionResult: null,
  loading: false,
  error: null,
  timer: 1800, // 30 min
  timeUp: false,
};

// 🔥 Slice
const codingPotdSlice = createSlice({
  name: 'codingPotd',
  initialState,
  reducers: {
    setCurrentQuestion: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    setTimer: (state, action) => {
      state.timer = action.payload;
    },
    timeUp: (state) => {
      state.timeUp = true;
    },
    clearSubmission: (state) => {
      state.submissionResult = null;
    },
    resetCodingPotd: () => initialState,
  },

  extraReducers: (builder) => {
    builder
      // ✅ FETCH
      .addCase(fetchCpotd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCpotd.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.data.questions;
      })
      .addCase(fetchCpotd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ SUBMIT
      .addCase(submitCpotdCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitCpotdCode.fulfilled, (state, action) => {
        state.loading = false;
        state.submissionResult = action.payload.data;
      })
      .addCase(submitCpotdCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// 🔥 Export actions
export const { setCurrentQuestion, clearSubmission, setTimer, timeUp, resetCodingPotd } =
  codingPotdSlice.actions;

// 🔥 Export reducer
export default codingPotdSlice.reducer;
