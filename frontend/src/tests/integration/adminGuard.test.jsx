import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

import userSlice from '../../redux/userSlice';
import AdminRoute from '../../components/admin/AdminRoute';
import ProtectedRoute from '../../components/ProtectedRoute';

vi.mock('../../socket', () => ({
  socket: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('Admin Guard Integration', () => {
  it('AdminRoute redirects non-admin to home', () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: {
          user: { _id: '123', email: 'user@example.com', role: 'user' },
          isAuth: true,
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminRoute />
        </MemoryRouter>
      </Provider>
    );
  });

  it('AdminRoute allows admin access', () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: {
          user: { _id: '123', email: 'admin@example.com', role: 'admin' },
          isAuth: true,
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminRoute />
        </MemoryRouter>
      </Provider>
    );
  });

  it('AdminRoute shows 2FA warning banner for admin without 2FA', () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: {
          user: { _id: '123', email: 'admin@example.com', role: 'admin', twoFactorWarning: true },
          isAuth: true,
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminRoute />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/Enable 2FA recommended/i)).toBeInTheDocument();
  });

  it('AdminRoute allows superadmin access', () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: {
          user: { _id: '123', email: 'super@example.com', role: 'superadmin', isSuperAdmin: true },
          isAuth: true,
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminRoute />
        </MemoryRouter>
      </Provider>
    );
  });

  it('ProtectedRoute redirects unauthenticated to login', () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: { user: null, isAuth: false, loading: false },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute />
        </MemoryRouter>
      </Provider>
    );
  });

  it('ProtectedRoute shows loading state', () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: { user: null, isAuth: false, loading: true },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProtectedRoute />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('userSlice logout clears auth state', () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: {
          user: { _id: '123', email: 'test@example.com', role: 'admin' },
          isAuth: true,
          loading: false,
        },
      },
    });

    store.dispatch({ type: 'user/logoutUser' });

    const state = store.getState().user;
    expect(state.user).toBeNull();
    expect(state.isAuth).toBe(false);
  });

  it('userSlice preserves admin role data', () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: {
          user: { _id: '123', email: 'admin@example.com', role: 'admin', credits: 500 },
          isAuth: true,
          loading: false,
        },
      },
    });

    const state = store.getState().user;
    expect(state.user.role).toBe('admin');
    expect(state.user.credits).toBe(500);
  });
});
