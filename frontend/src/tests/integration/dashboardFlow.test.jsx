import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";

import userSlice from "../../redux/userSlice";
import ProtectedRoute from "../../components/ProtectedRoute";

vi.mock("../../socket", () => ({
  socket: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe("Dashboard & Route Guard Integration", () => {
  it("ProtectedRoute shows loading state", () => {
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

  it("ProtectedRoute redirects unauthenticated users to login", () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: { user: null, isAuth: false, loading: false },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <ProtectedRoute />
        </MemoryRouter>
      </Provider>
    );
  });

  it("ProtectedRoute renders outlet for authenticated users", () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: {
          user: { _id: "123", email: "test@example.com", fullName: "Test" },
          isAuth: true,
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <ProtectedRoute />
        </MemoryRouter>
      </Provider>
    );
  });

  it("userSlice handles logout correctly", () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: {
          user: { _id: "123", email: "test@example.com" },
          isAuth: true,
          loading: false,
        },
      },
    });

    store.dispatch({ type: "user/logoutUser" });

    const state = store.getState().user;
    expect(state.user).toBeNull();
    expect(state.isAuth).toBe(false);
  });

  it("userSlice updates credits", () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: {
          user: { _id: "123", credits: 100 },
          isAuth: true,
          loading: false,
        },
      },
    });

    store.dispatch({ type: "user/updateCredits", payload: 150 });

    const state = store.getState().user;
    expect(state.user.credits).toBe(150);
  });

  it("userSlice loads friends data", () => {
    const store = configureStore({
      reducer: { user: userSlice },
      preloadedState: {
        user: {
          user: { _id: "123" },
          isAuth: true,
          loading: false,
          friends: [],
          friendRequests: { sent: [], received: [] },
        },
      },
    });

    store.dispatch({
      type: "user/loadFriends",
      payload: {
        friends: [{ _id: "f1", fullName: "Friend 1" }],
        friendRequests: { sent: [], received: [{ _id: "f2" }] },
      },
    });

    const state = store.getState().user;
    expect(state.friends).toHaveLength(1);
    expect(state.friendRequests.received).toHaveLength(1);
  });
});
