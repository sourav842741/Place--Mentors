import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import api from "../services/api.js";
import { toast } from "sonner";

export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (
    { page = 1, limit = 10, search = "", location = "", filters = {} },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams({
        page,
        limit,
        search,
        location,
        ...filters,
      });
      const response = await api.get(`/api/jobs?${params}`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch jobs");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const fetchSingleJob = createAsyncThunk(
  "jobs/fetchSingleJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      toast.error("Failed to load job details");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const matchJobs = createAsyncThunk(
  "jobs/matchJobs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/jobs/match");
      toast.success("AI job matching complete!");
      return response.data.matchedJobs;
    } catch (error) {
      toast.error("Matching failed");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const bookmarkJob = createAsyncThunk(
  "jobs/bookmarkJob",
  async (jobId, { rejectWithValue }) => {
    try {
      await api.post(`/api/jobs/bookmark/${jobId}`);
      toast.success("Job bookmarked!");
      return jobId;
    } catch (error) {
      toast.error("Failed to bookmark");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const unbookmarkJob = createAsyncThunk(
  "jobs/unbookmarkJob",
  async (jobId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/jobs/bookmark/${jobId}`);
      toast.success("Bookmark removed");
      return jobId;
    } catch (error) {
      toast.error("Failed to remove bookmark");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const applyJob = createAsyncThunk(
  "jobs/applyJob",
  async ({ jobId, resumeUrl, coverLetter }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/jobs/apply", {
        jobId,
        resumeUrl,
        coverLetter,
      });
      toast.success("Application tracked!");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const jobsAdapter = createEntityAdapter({
  selectId: (job) => job._id,
  sortComparer: (a, b) => new Date(b.postedDate) - new Date(a.postedDate),
});

const jobSlice = createSlice({
  name: "jobs",
  initialState: jobsAdapter.getInitialState({
    pagination: { current: 1, pages: 0, total: 0 },
    matchedJobs: [],
    bookmarks: [],
    applications: [],
    loading: false,
    filters: {},
    selectedJobId: null,
    singleJob: null,
  }),
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
    },
    clearJobs: jobsAdapter.removeAll,
    setSelectedJobId: (state, action) => {
      state.selectedJobId = action.payload;
    },
    clearSelectedJob: (state) => {
      state.selectedJobId = null;
      state.singleJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;

        jobsAdapter.setAll(state, action.payload.jobs);

        //  FIXED PAGINATION
        state.pagination = {
          page: action.payload.page,
          pages: action.payload.pages,
          total: action.payload.total,
        };
      })
      .addCase(fetchJobs.rejected, (state) => {
        state.loading = false;
      })
      // Fetch single job
      .addCase(fetchSingleJob.fulfilled, (state, action) => {
        state.loading = false;
        state.singleJob = action.payload;
      })
      .addCase(fetchSingleJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSingleJob.rejected, (state) => {
        state.loading = false;
      })
      // Match jobs
      .addCase(matchJobs.fulfilled, (state, action) => {
        state.matchedJobs = action.payload;
      })
      // Bookmark
      .addCase(bookmarkJob.fulfilled, (state, action) => {
        jobsAdapter.updateOne(state, {
          id: action.payload,
          changes: { isBookmarked: true },
        });
      })
      .addCase(unbookmarkJob.fulfilled, (state, action) => {
        jobsAdapter.updateOne(state, {
          id: action.payload,
          changes: { isBookmarked: false },
        });
      });
  },
});

export const { setFilters, clearJobs, setSelectedJobId, clearSelectedJob } =
  jobSlice.actions;
export const {
  selectAll: selectAllJobs,
  selectById: selectJobById,
  selectIds: selectJobIds,
} = jobsAdapter.getSelectors((state) => state.jobs);

export const selectSelectedJobId = (state) => state.jobs.selectedJobId;
export const selectSingleJob = (state) => state.jobs.singleJob;

export default jobSlice.reducer;
