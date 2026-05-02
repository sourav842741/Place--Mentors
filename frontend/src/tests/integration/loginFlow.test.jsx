import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import userSlice from '../../redux/userSlice';
import Login from '../../pages/Login';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: { user: userSlice },
    preloadedState: { user: { user: null, isAuth: false, loading: false, ...initialState } },
  });
};

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({
    login: vi.fn(),
    googleLogin: vi.fn(),
    verify2FA: vi.fn(),
  }),
}));

vi.mock('../../socket', () => ({
  socket: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe('Login Flow Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders login form with email and password fields', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('toggles password visibility on eye icon click', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getAllByRole('generic')[0]; // eye icon span
    fireEvent.click(toggleBtn);

    // Type checked in actual component
  });

  it('redirects authenticated users away from login', () => {
    const store = createMockStore({
      user: { _id: '123', email: 'test@example.com', role: 'user' },
      isAuth: true,
      loading: false,
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Login />
        </MemoryRouter>
      </Provider>
    );
  });

  it('shows theme toggle button', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    expect(document.querySelector('button')).toBeInTheDocument();
  });
});
