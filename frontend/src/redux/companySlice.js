import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { toast } from 'sonner';

export const fetchCompany = createAsyncThunk(
  'company/fetchCompany',
  async ({ name, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/company', { name, userId });
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

export const fetchCompanies = createAsyncThunk(
  'company/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/all');
      if (response.data.success) {
        return response.data.companies;
      }
      return rejectWithValue(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Network error' });
    }
  }
);

const companySlice = createSlice({
  name: 'company',
  initialState: {
    company: null,
    loading: false,
    error: null,
    credits: 0,
    companies: [],
    companiesLoading: false,
    companiesError: null,
  },

  reducers: {
    clearCompany: (state) => {
      state.company = null;
      state.error = null;
    },
    setCredits: (state, action) => {
      state.credits = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Single company cases
      .addCase(fetchCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.company = action.payload.company;
        state.credits = action.payload.remainingCredits;
        toast.success(`Fetched ${action.payload.company?.name || 'Company'} data!`);
      })
      .addCase(fetchCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch company';
        toast.error(state.error);
      })
      // Companies list cases
      .addCase(fetchCompanies.pending, (state) => {
        state.companiesLoading = true;
        state.companiesError = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companiesLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.companiesLoading = false;
        state.companiesError = action.payload?.message || 'Failed to fetch companies';
        toast.error(state.companiesError);
      });
  },
});

export const { clearCompany, setCredits } = companySlice.actions;
export default companySlice.reducer;
