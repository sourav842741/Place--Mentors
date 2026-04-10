import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async ({ tag = 'all', page = 1, limit = 50 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ page, limit });
      if (tag !== 'all') params.append('tag', tag);
      
      const response = await api.get(`/api/news?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch news');
    }
  }
);

export const fetchNewsStats = createAsyncThunk(
  'news/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/news/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    news: [],
    stats: {},
    loading: false,
    error: null,
    pagination: {},
    statsLoading: false
  },
  reducers: {
    clearNewsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch News
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
state.news = action.payload?.data?.news || action.payload?.news || [];
        state.pagination = action.payload.data.pagination || {};
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchNewsStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchNewsStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchNewsStats.rejected, (state) => {
        state.statsLoading = false;
      });
  }
});

export const { clearNewsError } = newsSlice.actions;
export default newsSlice.reducer;

