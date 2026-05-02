import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import * as taskApi from '../services/taskApi.js';
import { toast } from 'sonner';

// RTK Entity Adapter for normalized tasks state
const tasksAdapter = createEntityAdapter({
  selectId: (task) => task._id,
  sortComparer: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
});

// Initial state
const initialState = tasksAdapter.getInitialState({
  stats: null,
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  selectedTask: null,
});

// Async Thunks
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await taskApi.getMyTasks();
    return response.data.data || [];
  } catch (error) {
    toast.error('Failed to fetch tasks');
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskApi.createTask(taskData);
      toast.success('Task created successfully!');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, ...taskData }, { rejectWithValue }) => {
    try {
      const response = await taskApi.updateTask(id, taskData);
      toast.success('Task updated successfully!');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id, { rejectWithValue }) => {
  try {
    await taskApi.deleteTask(id);
    toast.success('Task deleted successfully!');
    return id;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to delete task');
    return rejectWithValue(error.response?.data);
  }
});

export const toggleTask = createAsyncThunk('tasks/toggleTask', async (id, { rejectWithValue }) => {
  try {
    const response = await taskApi.toggleTask(id);
    toast.success('Task status updated!');
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to toggle task');
    return rejectWithValue(error.response?.data);
  }
});

export const shareTask = createAsyncThunk('tasks/shareTask', async (id, { rejectWithValue }) => {
  try {
    const response = await taskApi.shareTask(id);
    const shareUrl = `${window.location.origin}/share/task/${response.data.shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success(`Share link copied to clipboard!`);
    return response.data.data;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to generate share link');
    return rejectWithValue(error.response?.data);
  }
});

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskApi.getTaskStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchPublicTask = createAsyncThunk(
  'tasks/fetchPublicTask',
  async (shareId, { rejectWithValue }) => {
    try {
      const response = await taskApi.getPublicTask(shareId);
      return response.data.data;
    } catch (error) {
      toast.error('Task not found');
      return rejectWithValue(error.response?.data);
    }
  }
);

// Slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    taskAdded: tasksAdapter.addOne,
    taskUpdated: tasksAdapter.updateOne,
    taskDeleted: tasksAdapter.removeOne,
    clearTasks: tasksAdapter.removeAll,
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        tasksAdapter.setAll(state, action.payload);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create Task (optimistic)
      .addCase(createTask.fulfilled, (state, action) => {
        tasksAdapter.addOne(state, action.payload);
      })

      // Update Task (optimistic)
      .addCase(updateTask.fulfilled, (state, action) => {
        tasksAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })

      // Delete Task (optimistic)
      .addCase(deleteTask.fulfilled, (state, action) => {
        tasksAdapter.removeOne(state, action.payload);
      })

      // Toggle Task
      .addCase(toggleTask.fulfilled, (state, action) => {
        tasksAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })

      // Share Task
      .addCase(shareTask.fulfilled, (state, action) => {
        tasksAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })

      // Stats
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const {
  taskAdded,
  taskUpdated,
  taskDeleted,
  clearTasks,
  setSelectedTask,
  clearSelectedTask,
} = tasksSlice.actions;

export default tasksSlice.reducer;

// Selectors
export const {
  selectAll: selectAllTasks,
  selectById: selectTaskById,
  selectIds: selectTaskIds,
} = tasksAdapter.getSelectors((state) => state.tasks);

export const selectTasksStats = (state) => state.tasks.stats;
export const selectTasksStatus = (state) => state.tasks.status;
export const selectSelectedTask = (state) => state.tasks.selectedTask;
