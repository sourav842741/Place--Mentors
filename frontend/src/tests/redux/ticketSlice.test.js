import { describe, it, expect } from 'vitest';
import ticketReducer, {
  clearTicketDetail,
  clearTicketError,
  updateTicketFromSocket,
  removeTicketFromSocket,
} from '../../redux/ticketSlice.js';

describe('ticketSlice - reducers', () => {
  const baseState = {
    tickets: [
      { _id: 't1', ticketId: 'PM-1001', subject: 'Login issue', status: 'Open', replyCount: 0 },
      { _id: 't2', ticketId: 'PM-1002', subject: 'Payment', status: 'Solved', replyCount: 2 },
    ],
    ticketDetail: { _id: 't1', ticketId: 'PM-1001', status: 'Open', replyCount: 0 },
    replies: [],
    internalNotes: [],
    stats: null,
    loading: false,
    detailLoading: false,
    actionLoading: false,
    error: null,
    pagination: { page: 1, limit: 20, total: 2, pages: 1 },
  };

  /* ================= clearTicketDetail ================= */
  describe('clearTicketDetail', () => {
    it('clears ticket detail, replies, and internal notes', () => {
      const state = ticketReducer(baseState, clearTicketDetail());
      expect(state.ticketDetail).toBeNull();
      expect(state.replies).toEqual([]);
      expect(state.internalNotes).toEqual([]);
    });
  });

  /* ================= clearTicketError ================= */
  describe('clearTicketError', () => {
    it('clears error state', () => {
      const errorState = { ...baseState, error: 'Some error' };
      const state = ticketReducer(errorState, clearTicketError());
      expect(state.error).toBeNull();
    });
  });

  /* ================= updateTicketFromSocket ================= */
  describe('updateTicketFromSocket', () => {
    it('updates ticket status in list and detail', () => {
      const payload = {
        ticketId: 't1',
        action: 'status_changed',
        status: 'In Progress',
        replyCount: 1,
      };
      const state = ticketReducer(baseState, updateTicketFromSocket(payload));
      expect(state.tickets[0].status).toBe('In Progress');
      expect(state.tickets[0].replyCount).toBe(1);
      expect(state.ticketDetail.status).toBe('In Progress');
    });

    it('adds new ticket to list on created action', () => {
      const payload = {
        ticketId: 't3',
        action: 'created',
        ticket: { _id: 't3', ticketId: 'PM-1003', subject: 'New', status: 'Open' },
      };
      const state = ticketReducer(baseState, updateTicketFromSocket(payload));
      expect(state.tickets).toHaveLength(3);
      expect(state.tickets[0].ticketId).toBe('PM-1003');
      expect(state.pagination.total).toBe(3);
    });

    it('appends reply to detail when viewing ticket', () => {
      const payload = {
        ticketId: 't1',
        action: 'replied',
        reply: {
          _id: 'r1',
          ticket: 't1',
          message: 'Thanks',
          isInternal: false,
          senderRole: 'admin',
        },
        replyCount: 1,
      };
      const state = ticketReducer(baseState, updateTicketFromSocket(payload));
      expect(state.replies).toHaveLength(1);
      expect(state.replies[0].message).toBe('Thanks');
      expect(state.ticketDetail.replyCount).toBe(1);
    });

    it('deduplicates existing replies', () => {
      const withReply = {
        ...baseState,
        replies: [{ _id: 'r1', message: 'Thanks' }],
      };
      const payload = {
        ticketId: 't1',
        action: 'replied',
        reply: { _id: 'r1', message: 'Thanks', isInternal: false },
      };
      const state = ticketReducer(withReply, updateTicketFromSocket(payload));
      expect(state.replies).toHaveLength(1);
    });

    it('adds internal notes for admin', () => {
      const payload = {
        ticketId: 't1',
        action: 'replied',
        reply: { _id: 'n1', isInternal: true, message: 'Note' },
      };
      const state = ticketReducer(baseState, updateTicketFromSocket(payload));
      expect(state.internalNotes).toHaveLength(1);
      expect(state.internalNotes[0].message).toBe('Note');
    });
  });

  /* ================= removeTicketFromSocket ================= */
  describe('removeTicketFromSocket', () => {
    it('removes ticket from list', () => {
      const payload = { ticketId: 't1' };
      const state = ticketReducer(baseState, removeTicketFromSocket(payload));
      expect(state.tickets).toHaveLength(1);
      expect(state.tickets[0]._id).toBe('t2');
    });

    it('clears detail if removed ticket was being viewed', () => {
      const payload = { ticketId: 't1' };
      const state = ticketReducer(baseState, removeTicketFromSocket(payload));
      expect(state.ticketDetail).toBeNull();
      expect(state.replies).toEqual([]);
      expect(state.internalNotes).toEqual([]);
    });
  });
});
