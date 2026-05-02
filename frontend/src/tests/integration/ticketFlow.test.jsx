import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

import userSlice from '../../redux/userSlice';
import ticketSlice from '../../redux/ticketSlice';
import SupportPage from '../../pages/SupportPage';

const createMockStore = (ticketState = {}, userState = {}) => {
  return configureStore({
    reducer: { user: userSlice, tickets: ticketSlice },
    preloadedState: {
      user: {
        user: { _id: '123', email: 'test@example.com', fullName: 'Test User', credits: 100 },
        isAuth: true,
        loading: false,
        ...userState,
      },
      tickets: {
        tickets: [],
        ticketDetail: null,
        replies: [],
        internalNotes: [],
        stats: null,
        loading: false,
        detailLoading: false,
        actionLoading: false,
        error: null,
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        ...ticketState,
      },
    },
  });
};

vi.mock('../../services/ticketApi', () => ({
  createTicket: vi.fn(() =>
    Promise.resolve({
      data: { data: { ticketId: 'PM-1001', subject: 'Test', status: 'Open' } },
    })
  ),
  getMyTickets: vi.fn(() =>
    Promise.resolve({
      data: { data: { tickets: [], pagination: { total: 0 } } },
    })
  ),
  replyToTicket: vi.fn(() =>
    Promise.resolve({
      data: { data: { message: 'Reply sent', _id: 'r1' } },
    })
  ),
}));

vi.mock('../../socket', () => ({
  socket: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('Ticket Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders support page with ticket creation form', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SupportPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/support center/i)).toBeInTheDocument();
  });

  it('ticket slice handles create ticket success', async () => {
    const store = createMockStore();

    store.dispatch({
      type: 'tickets/createNewTicket/fulfilled',
      payload: { _id: 't1', ticketId: 'PM-1001', subject: 'Login Issue', status: 'Open' },
    });

    const state = store.getState().tickets;
    expect(state.tickets).toHaveLength(1);
    expect(state.tickets[0].ticketId).toBe('PM-1001');
  });

  it('ticket slice handles fetch my tickets', () => {
    const store = createMockStore();

    store.dispatch({
      type: 'tickets/fetchMyTickets/fulfilled',
      payload: {
        tickets: [
          { _id: 't1', ticketId: 'PM-1001', subject: 'Issue 1', status: 'Open' },
          { _id: 't2', ticketId: 'PM-1002', subject: 'Issue 2', status: 'Solved' },
        ],
        pagination: { page: 1, limit: 20, total: 2, pages: 1 },
      },
    });

    const state = store.getState().tickets;
    expect(state.tickets).toHaveLength(2);
    expect(state.pagination.total).toBe(2);
  });

  it('ticket slice handles reply success', () => {
    const store = createMockStore({
      ticketDetail: { _id: 't1', replyCount: 0, status: 'Open' },
      tickets: [{ _id: 't1', replyCount: 0, status: 'Open' }],
    });

    store.dispatch({
      type: 'tickets/replyTicket/fulfilled',
      payload: {
        _id: 'r1',
        message: 'Thanks',
        ticket: 't1',
        senderRole: 'user',
        isInternal: false,
      },
    });

    const state = store.getState().tickets;
    expect(state.replies).toHaveLength(1);
    expect(state.ticketDetail.replyCount).toBe(1);
  });

  it('ticket slice handles reopen ticket', () => {
    const store = createMockStore({
      tickets: [{ _id: 't1', status: 'Solved', isReopened: false }],
      ticketDetail: { _id: 't1', status: 'Solved' },
    });

    store.dispatch({
      type: 'tickets/reopenUserTicket/fulfilled',
      payload: { _id: 't1', status: 'Open', isReopened: true },
    });

    const state = store.getState().tickets;
    expect(state.tickets[0].status).toBe('Open');
    expect(state.tickets[0].isReopened).toBe(true);
  });

  it('ticket slice handles admin status update', () => {
    const store = createMockStore({
      tickets: [{ _id: 't1', status: 'Open' }],
      ticketDetail: { _id: 't1', status: 'Open' },
    });

    store.dispatch({
      type: 'tickets/updateAdminTicketStatus/fulfilled',
      payload: { _id: 't1', status: 'Solved' },
    });

    const state = store.getState().tickets;
    expect(state.tickets[0].status).toBe('Solved');
    expect(state.ticketDetail.status).toBe('Solved');
  });

  it('ticket slice handles socket update', () => {
    const store = createMockStore({
      tickets: [{ _id: 't1', status: 'Open', replyCount: 0 }],
      ticketDetail: { _id: 't1', status: 'Open', replyCount: 0 },
    });

    store.dispatch({
      type: 'tickets/updateTicketFromSocket',
      payload: { ticketId: 't1', action: 'replied', replyCount: 1, newStatus: 'In Progress' },
    });

    const state = store.getState().tickets;
    expect(state.tickets[0].replyCount).toBe(1);
    expect(state.tickets[0].status).toBe('In Progress');
  });

  it('ticket slice handles fetch error', () => {
    const store = createMockStore();

    store.dispatch({
      type: 'tickets/fetchMyTickets/rejected',
      payload: 'Failed to fetch tickets',
    });

    const state = store.getState().tickets;
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed to fetch tickets');
  });

  it('clears ticket detail on logout', () => {
    const store = createMockStore({
      ticketDetail: { _id: 't1', subject: 'Test' },
      replies: [{ _id: 'r1', message: 'Hi' }],
    });

    store.dispatch({ type: 'tickets/clearTicketDetail' });

    const state = store.getState().tickets;
    expect(state.ticketDetail).toBeNull();
    expect(state.replies).toEqual([]);
  });
});
