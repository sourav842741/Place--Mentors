import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'sonner';
import api from '../services/api.js';

export const uploadResumeAndAnalyze = createAsyncThunk(
  'resume/uploadResumeAndAnalyze',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/planner/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Analysis failed. Please try again.';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    loading: false,
    error: null,
    analysis: null,
    fileName: '',
    previewText: '',
  },
  reducers: {
    clearAnalysis: (state) => {
      state.analysis = null;
      state.error = null;
      state.fileName = '';
      state.previewText = '';
    },
    setFileName: (state, action) => {
      state.fileName = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadResumeAndAnalyze.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadResumeAndAnalyze.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload.analysis;
        state.previewText = action.payload.extractedText || '';
        toast.success('Resume analysis complete!');
      })
      .addCase(uploadResumeAndAnalyze.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnalysis, setFileName } = resumeSlice.actions;
export default resumeSlice.reducer;
export const selectResume = (state) => state.resume;
