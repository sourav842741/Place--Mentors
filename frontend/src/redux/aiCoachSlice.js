import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import api from '../services/api.js';
import { toast } from 'sonner';

/* =========================
   ENTITY ADAPTER
========================= */
const historyAdapter = createEntityAdapter({
  selectId: (chat) => chat._id,
  sortComparer: (a, b) =>
    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt),
});

/* =========================
   HELPERS
========================= */

// safely unwrap nested ApiResponse structures
const unwrapResponse = (response) => {
  return response?.data?.data?.data || response?.data?.data || response?.data || [];
};

const ensureArray = (value) => {
  return Array.isArray(value) ? value : [];
};

/* =========================
   INITIAL STATE
========================= */
const initialState = {
  messages: [],
  loading: false,
  error: null,

  history: historyAdapter.getInitialState(),
  historyLoading: false,

  currentChatId: null,
};

/* =========================
   THUNKS
========================= */

// fetch all chat history
export const fetchHistory = createAsyncThunk(
  'aiCoach/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/ai/coach/history');
      return unwrapResponse(response);
    } catch (error) {
      toast.error('Failed to load history');
      return rejectWithValue(error?.response?.data?.message || 'Failed to load history');
    }
  }
);

// send message
export const sendMessage = createAsyncThunk(
  'aiCoach/sendMessage',
  async ({ message, chatId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/ai/coach/chat', {
        message,
        chatId,
      });

      return unwrapResponse(response);
    } catch (error) {
      toast.error('Failed to send message');
      return rejectWithValue(error?.response?.data?.message || 'Failed to send message');
    }
  }
);

// quick prompt
export const newQuickChat = createAsyncThunk(
  'aiCoach/newQuickChat',
  async (type, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/ai/coach/quick/${type}`);
      return unwrapResponse(response);
    } catch (error) {
      toast.error('Quick prompt failed');
      return rejectWithValue(error?.response?.data?.message || 'Quick prompt failed');
    }
  }
);

// delete chat
export const clearChat = createAsyncThunk(
  'aiCoach/clearChat',
  async (chatId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/ai/coach/${chatId}`);
      return chatId;
    } catch (error) {
      toast.error('Failed to clear chat');
      return rejectWithValue(error?.response?.data?.message || 'Failed to clear chat');
    }
  }
);

/* =========================
   SLICE
========================= */

const aiCoachSlice = createSlice({
  name: 'aiCoach',
  initialState,

  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.currentChatId = null;
    },

    setMessages: (state, action) => {
      state.messages = ensureArray(action.payload);
    },

    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },

    resetCoachState: (state) => {
      state.messages = [];
      state.loading = false;
      state.error = null;
      state.currentChatId = null;
      historyAdapter.removeAll(state.history);
    },
  },

  extraReducers: (builder) => {
    builder

      /* =========================
         FETCH HISTORY
      ========================= */
      .addCase(fetchHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })

      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.historyLoading = false;

        const chats = ensureArray(action.payload).filter((chat) => chat && chat._id);

        historyAdapter.setAll(state.history, chats);
      })

      .addCase(fetchHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      })

      /* =========================
         SEND MESSAGE
      ========================= */
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;

        state.messages = ensureArray(action.payload.messages);
        state.currentChatId = action.payload.chatId;

        historyAdapter.upsertOne(state.history, {
          _id: action.payload.chatId,
          title: action.payload.title || 'New Chat',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          messageCount: state.messages.length,
          preview: state.messages[state.messages.length - 1]?.text?.slice(0, 100) || '',
        });
      })

      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =========================
         QUICK CHAT
      ========================= */
      .addCase(newQuickChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(newQuickChat.fulfilled, (state, action) => {
        state.loading = false;

        state.messages = ensureArray(action.payload.messages);
        state.currentChatId = action.payload.chatId;

        historyAdapter.upsertOne(state.history, {
          _id: action.payload.chatId,
          title: action.payload.title || 'Quick Chat',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          messageCount: state.messages.length,
          preview: state.messages[state.messages.length - 1]?.text?.slice(0, 100) || '',
        });
      })

      .addCase(newQuickChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =========================
         CLEAR CHAT
      ========================= */
      .addCase(clearChat.fulfilled, (state, action) => {
        historyAdapter.removeOne(state.history, action.payload);

        if (state.currentChatId === action.payload) {
          state.messages = [];
          state.currentChatId = null;
        }
      });
  },
});

/* =========================
   EXPORT ACTIONS
========================= */
export const { clearMessages, setMessages, setCurrentChatId, resetCoachState } =
  aiCoachSlice.actions;

/* =========================
   SELECTORS
========================= */

export const { selectAll: selectHistory, selectById: selectHistoryById } =
  historyAdapter.getSelectors((state) => state.aiCoach.history);

export const selectMessages = (state) => state.aiCoach.messages;
export const selectLoading = (state) => state.aiCoach.loading;
export const selectError = (state) => state.aiCoach.error;
export const selectHistoryLoading = (state) => state.aiCoach.historyLoading;
export const selectCurrentChatId = (state) => state.aiCoach.currentChatId;

/* =========================
   REDUCER
========================= */
export default aiCoachSlice.reducer;
