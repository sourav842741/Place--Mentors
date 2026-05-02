import { describe, it, expect } from "vitest";
import userReducer, {
  setUserData,
  logoutUser,
  setLoading,
  updateCredits,
  loadFriends,
  updateFriendRequests,
  updateFriends,
  updateChallenges,
} from "../../redux/userSlice.js";

describe("userSlice", () => {
  const initialState = {
    user: null,
    friends: [],
    friendRequests: { sent: [], received: [] },
    challenges: { sent: [], received: [] },
    isAuth: false,
    loading: true,
  };

  /* ================= setUserData ================= */
  describe("setUserData", () => {
    it("sets user and isAuth to true", () => {
      const user = { _id: "123", fullName: "John", email: "john@test.com" };
      const state = userReducer(initialState, setUserData(user));
      expect(state.user).toEqual(user);
      expect(state.isAuth).toBe(true);
      expect(state.loading).toBe(false);
    });

    it("handles null payload (logout-like)", () => {
      const loggedInState = { ...initialState, user: { _id: "1" }, isAuth: true };
      const state = userReducer(loggedInState, setUserData(null));
      expect(state.user).toBeNull();
      expect(state.isAuth).toBe(false);
      expect(state.loading).toBe(false);
    });
  });

  /* ================= logoutUser ================= */
  describe("logoutUser", () => {
    it("clears user and sets isAuth false", () => {
      const loggedInState = {
        ...initialState,
        user: { _id: "1" },
        isAuth: true,
        friends: [{ _id: "2" }],
      };
      const state = userReducer(loggedInState, logoutUser());
      expect(state.user).toBeNull();
      expect(state.isAuth).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.friends).toEqual([{ _id: "2" }]); // friends not cleared
    });
  });

  /* ================= setLoading ================= */
  describe("setLoading", () => {
    it("sets loading to true", () => {
      const state = userReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it("sets loading to false", () => {
      const state = userReducer(initialState, setLoading(false));
      expect(state.loading).toBe(false);
    });

    it("ignores non-boolean payload", () => {
      const state = userReducer(initialState, setLoading("yes"));
      expect(state.loading).toBe(true); // unchanged because typeof !== boolean
    });
  });

  /* ================= updateCredits ================= */
  describe("updateCredits", () => {
    it("updates user credits when logged in", () => {
      const loggedInState = { ...initialState, user: { _id: "1", credits: 100 } };
      const state = userReducer(loggedInState, updateCredits(150));
      expect(state.user.credits).toBe(150);
    });

    it("does nothing when user is null", () => {
      const state = userReducer(initialState, updateCredits(200));
      expect(state.user).toBeNull();
    });
  });

  /* ================= loadFriends ================= */
  describe("loadFriends", () => {
    it("loads friends and friend requests", () => {
      const payload = {
        friends: [{ _id: "2" }],
        friendRequests: { sent: ["3"], received: ["4"] },
      };
      const state = userReducer(initialState, loadFriends(payload));
      expect(state.friends).toEqual([{ _id: "2" }]);
      expect(state.friendRequests).toEqual({ sent: ["3"], received: ["4"] });
    });

    it("handles missing payload fields", () => {
      const state = userReducer(initialState, loadFriends({}));
      expect(state.friends).toEqual([]);
      expect(state.friendRequests).toEqual({ sent: [], received: [] });
    });
  });

  /* ================= updateFriendRequests ================= */
  describe("updateFriendRequests", () => {
    it("updates friend requests", () => {
      const payload = { sent: ["5"], received: ["6"] };
      const state = userReducer(initialState, updateFriendRequests(payload));
      expect(state.friendRequests).toEqual(payload);
    });
  });

  /* ================= updateFriends ================= */
  describe("updateFriends", () => {
    it("updates friends list", () => {
      const payload = [{ _id: "7" }, { _id: "8" }];
      const state = userReducer(initialState, updateFriends(payload));
      expect(state.friends).toEqual(payload);
    });
  });

  /* ================= updateChallenges ================= */
  describe("updateChallenges", () => {
    it("updates challenges", () => {
      const payload = { sent: ["9"], received: ["10"] };
      const state = userReducer(initialState, updateChallenges(payload));
      expect(state.challenges).toEqual(payload);
    });
  });
});
