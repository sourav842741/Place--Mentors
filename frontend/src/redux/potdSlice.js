import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api.js";

export const fetchPotd = createAsyncThunk("potd/fetchPotd", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get("/api/potd");
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message || "Failed to fetch POTD");
  }
});

export const submitPotd = createAsyncThunk(
  "potd/submitPotd",
  async (userAnswers, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/potd/submit", {
        answers: userAnswers,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || "Submission failed");
    }
  }
);

const potdSlice = createSlice({
  name: "potd",
  initialState: {
    questions: [],
    userAnswers: {},
    result: null,
    loading: false,
    error: null,
    submitted: false,
  },
  reducers: {
    selectAnswer: (state, action) => {
      const { questionIndex, selected } = action.payload;
      state.userAnswers[questionIndex] = selected;
      state.error = null;
    },
    resetPotd: (state) => {
      state.questions = [];
      state.userAnswers = {};
      state.result = null;
      state.loading = false;
      state.error = null;
      state.submitted = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch POTD
      .addCase(fetchPotd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPotd.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload.data?.questions || [];
      })
      .addCase(fetchPotd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit
      .addCase(submitPotd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitPotd.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload.data;
        state.submitted = true;
      })
      .addCase(submitPotd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectAnswer, resetPotd } = potdSlice.actions;
export default potdSlice.reducer;
