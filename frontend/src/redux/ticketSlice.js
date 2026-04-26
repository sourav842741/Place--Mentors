import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as ticketApi from "../services/ticketApi.js";
import * as supportApi from "../services/supportApi.js";
import { toast } from "sonner";

const initialState = {
  tickets: [],
  ticketDetail: null,
  replies: [],
  internalNotes: [],
  stats: null,
  loading: false,
  detailLoading: false,
  actionLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// ================= ASYNC THUNKS =================

export const fetchMyTickets = createAsyncThunk(
  "tickets/fetchMyTickets",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ticketApi.getMyTickets(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tickets");
    }
  }
);

export const fetchTicketDetail = createAsyncThunk(
  "tickets/fetchTicketDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ticketApi.getTicketDetail(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch ticket detail");
    }
  }
);

export const createNewTicket = createAsyncThunk(
  "tickets/createNewTicket",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await ticketApi.createTicket(formData);
      toast.success(`Ticket created: ${response.data.data.ticketId}`);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create ticket");
      return rejectWithValue(error.response?.data?.message || "Failed to create ticket");
    }
  }
);

export const replyTicket = createAsyncThunk(
  "tickets/replyTicket",
  async ({ id, message, isInternal }, { rejectWithValue }) => {
    try {
      const response = await ticketApi.replyToTicket(id, { message, isInternal });
      toast.success(isInternal ? "Internal note added" : "Reply sent successfully");
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reply");
      return rejectWithValue(error.response?.data?.message || "Failed to send reply");
    }
  }
);

export const reopenUserTicket = createAsyncThunk(
  "tickets/reopenUserTicket",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ticketApi.reopenTicket(id);
      toast.success("Ticket reopened successfully");
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reopen ticket");
      return rejectWithValue(error.response?.data?.message || "Failed to reopen ticket");
    }
  }
);

// Admin thunks
export const fetchAllTickets = createAsyncThunk(
  "tickets/fetchAllTickets",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await ticketApi.getAllTickets(params);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch tickets");
    }
  }
);

export const fetchTicketStats = createAsyncThunk(
  "tickets/fetchTicketStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ticketApi.getTicketStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

export const updateAdminTicketStatus = createAsyncThunk(
  "tickets/updateAdminTicketStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await ticketApi.updateTicketStatus(
        id,
        status
      );

      toast.success(`Status updated to ${status}`);
      return response.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update status"
      );

      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update status"
      );
    }
  }
);

export const deleteAdminTicket = createAsyncThunk(
  "tickets/deleteAdminTicket",
  async (id, { rejectWithValue }) => {
    try {
      await ticketApi.deleteTicket(id);
      toast.success("Ticket deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete ticket");
      return rejectWithValue(error.response?.data?.message || "Failed to delete ticket");
    }
  }
);

export const escalateToTicket = createAsyncThunk(
  "tickets/escalateToTicket",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await supportApi.escalateTicket(formData);
      toast.success(`Ticket escalated: ${response.data.data.ticketId}`);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to escalate ticket");
      return rejectWithValue(error.response?.data?.message || "Failed to escalate ticket");
    }
  }
);

// ================= SLICE =================

const ticketSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    clearTicketDetail: (state) => {
      state.ticketDetail = null;
      state.replies = [];
      state.internalNotes = [];
    },
    clearTicketError: (state) => {
      state.error = null;
    },
    // For real-time socket updates
    updateTicketFromSocket: (state, action) => {
      const { ticketId, action: socketAction, ticket: socketTicket, reply, newStatus, replyCount, status } = action.payload;

      // Update in ticket list
      const listIdx = state.tickets.findIndex((t) => t._id === ticketId || t._id === socketTicket?._id);
      if (listIdx !== -1) {
        if (socketTicket) {
          state.tickets[listIdx] = { ...state.tickets[listIdx], ...socketTicket };
        }
        if (newStatus) {
          state.tickets[listIdx].status = newStatus;
        }
        if (status) {
          state.tickets[listIdx].status = status;
        }
        if (replyCount !== undefined) {
          state.tickets[listIdx].replyCount = replyCount;
        }
      } else if (socketAction === "created" && socketTicket) {
        // New ticket from socket (admin view)
        state.tickets.unshift(socketTicket);
        state.pagination.total += 1;
      }

      // Update ticket detail if currently viewing
      if (state.ticketDetail && (state.ticketDetail._id === ticketId || state.ticketDetail._id === socketTicket?._id)) {
        if (socketTicket) {
          state.ticketDetail = { ...state.ticketDetail, ...socketTicket };
        }
        if (newStatus) {
          state.ticketDetail.status = newStatus;
        }
        if (status) {
          state.ticketDetail.status = status;
        }
        if (replyCount !== undefined) {
          state.ticketDetail.replyCount = replyCount;
        }
        if (reply && !reply.isInternal) {
          const alreadyExists = state.replies.some((r) => r._id === reply._id);
          if (!alreadyExists) {
            state.replies.push(reply);
          }
        }
        if (reply && reply.isInternal) {
          const alreadyExists = state.internalNotes.some((r) => r._id === reply._id);
          if (!alreadyExists) {
            state.internalNotes.push(reply);
          }
        }
      }
    },
    removeTicketFromSocket: (state, action) => {
      const { ticketId } = action.payload;
      state.tickets = state.tickets.filter((t) => t._id !== ticketId);
      if (state.ticketDetail?._id === ticketId) {
        state.ticketDetail = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch my tickets
      .addCase(fetchMyTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.tickets;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch ticket detail
      .addCase(fetchTicketDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchTicketDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.ticketDetail = action.payload.ticket;
        state.replies = action.payload.replies;
        state.internalNotes = action.payload.internalNotes || [];
      })
      .addCase(fetchTicketDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // Create ticket
      .addCase(createNewTicket.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(createNewTicket.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.tickets.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createNewTicket.rejected, (state) => {
        state.actionLoading = false;
      })

      // Reply
      .addCase(replyTicket.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(replyTicket.fulfilled, (state, action) => {
        state.actionLoading = false;
        const reply = action.payload;

        if (!reply.isInternal) {
          const alreadyExists = state.replies.some((r) => r._id === reply._id);
          if (!alreadyExists) {
            state.replies.push(reply);
          }
        } else {
          const alreadyExists = state.internalNotes.some((n) => n._id === reply._id);
          if (!alreadyExists) {
            state.internalNotes.push(reply);
          }
        }

        // Update reply count and last reply on current detail
        if (state.ticketDetail) {
          state.ticketDetail.replyCount = (state.ticketDetail.replyCount || 0) + 1;
          state.ticketDetail.lastReplyAt = new Date().toISOString();
          // If admin reply auto-changed status to In Progress
          if (reply.senderRole === "admin" || reply.senderRole === "superadmin") {
            if (state.ticketDetail.status === "Open") {
              state.ticketDetail.status = "In Progress";
            }
          }
        }

        // Also update in the list
        const listIdx = state.tickets.findIndex((t) => t._id === reply.ticket);
        if (listIdx !== -1) {
          state.tickets[listIdx].replyCount = (state.tickets[listIdx].replyCount || 0) + 1;
          state.tickets[listIdx].lastReplyAt = new Date().toISOString();
          if (reply.senderRole === "admin" || reply.senderRole === "superadmin") {
            if (state.tickets[listIdx].status === "Open") {
              state.tickets[listIdx].status = "In Progress";
            }
          }
        }
      })
      .addCase(replyTicket.rejected, (state) => {
        state.actionLoading = false;
      })

      // Reopen
      .addCase(reopenUserTicket.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(reopenUserTicket.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        const idx = state.tickets.findIndex((t) => t._id === updated._id);
        if (idx !== -1) {
          state.tickets[idx] = updated;
        }
        if (state.ticketDetail?._id === updated._id) {
          state.ticketDetail = updated;
        }
      })
      .addCase(reopenUserTicket.rejected, (state) => {
        state.actionLoading = false;
      })

      // Admin: fetch all
      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.tickets;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: stats
      .addCase(fetchTicketStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Admin: update status
      .addCase(updateAdminTicketStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(updateAdminTicketStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated = action.payload;
        const idx = state.tickets.findIndex((t) => t._id === updated._id);
        if (idx !== -1) {
          state.tickets[idx] = updated;
        }
        if (state.ticketDetail?._id === updated._id) {
          state.ticketDetail = updated;
        }
      })
      .addCase(updateAdminTicketStatus.rejected, (state) => {
        state.actionLoading = false;
      })

      // Admin: delete
      .addCase(deleteAdminTicket.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(deleteAdminTicket.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.tickets = state.tickets.filter((t) => t._id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.ticketDetail?._id === action.payload) {
          state.ticketDetail = null;
          state.replies = [];
          state.internalNotes = [];
        }
      })
      .addCase(deleteAdminTicket.rejected, (state) => {
        state.actionLoading = false;
      })

      // Escalate from AI chat
      .addCase(escalateToTicket.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(escalateToTicket.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.tickets.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(escalateToTicket.rejected, (state) => {
        state.actionLoading = false;
      });
  },
});

export const { clearTicketDetail, clearTicketError, updateTicketFromSocket, removeTicketFromSocket } = ticketSlice.actions;
export default ticketSlice.reducer;

