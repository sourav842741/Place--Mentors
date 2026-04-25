import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../../components/ProtectedRoute.jsx';
import userReducer from '../../redux/userSlice.js';

const TestHome = () => <div data-testid="home">Home</div>;
const TestLogin = () => <div data-testid="login">Login</div>;

const createWrapper = (userState) => {
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState: {
      user: userState,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<TestLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<TestHome />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  it('shows loading text when loading', () => {
    createWrapper({ user: null, isAuth: false, loading: true });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders outlet when authenticated', () => {
    createWrapper({ user: { _id: '1' }, isAuth: true, loading: false });
    expect(screen.getByTestId('home')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', () => {
    createWrapper({ user: null, isAuth: false, loading: false });
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });
});

