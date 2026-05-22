import { useDispatch, useSelector } from "react-redux";
import { setUserData, logoutUser, setLoading } from "../redux/userSlice";
import api from "../services/api";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { socket } from "../socket";
import { toast } from "sonner";

let googleInFlight = false;
const getDeviceId = () => {
  let deviceId = localStorage.getItem("pm_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    localStorage.setItem("pm_device_id", deviceId);
  }
  return deviceId;
};

const useAuth = () => {
  const { user, loading } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ================= LOGIN =================
  const login = async (form) => {
    try {
      const res = await api.post("/api/auth/signin", {
        ...form,
        deviceId: getDeviceId(),
      });

      const data = res.data.data;

      // 2FA required — don't dispatch user yet
      if (data?.requiresTwoFactor) {
        return {
          success: true,
          requiresTwoFactor: true,
          tempAuthToken: data.tempAuthToken,
          role: data.role,
          isSuperAdmin: data.isSuperAdmin,
        };
      }

      if (data?.deviceId) {
        localStorage.setItem("pm_device_id", data.deviceId);
      }

      dispatch(setUserData(data));

      if (data?._id) {
        if (!socket.connected) socket.connect();
        socket.emit("join", data._id);
        console.log("Socket joined room after login:", data._id);
      }

      return res.data;
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      return {
        success: false,
        statusCode: err.response?.status,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  // ================= VERIFY 2FA =================
  const verify2FA = async (tempAuthToken, token, rememberDevice = false) => {
    try {
      const res = await api.post("/api/auth/2fa/login", {
        tempAuthToken,
        token,
        rememberDevice,
      });

      const data = res.data?.data;

      if (data?.deviceId) {
        localStorage.setItem("pm_device_id", data.deviceId);
      }

      dispatch(setUserData(data));
      if (data?._id) {
        if (!socket.connected) socket.connect();
        socket.emit("join", data._id);
      }

      return { success: true, data };
    } catch (err) {
      console.error("2FA VERIFY ERROR:", err);

      return {
        success: false,
        statusCode: err.response?.status,
        message: err.response?.data?.message || "2FA verification failed",
      };
    }
  };

  // ================= 2FA SETUP =================
  const setup2FA = async () => {
    try {
      const res = await api.post("/api/auth/2fa/setup");
      return { success: true, data: res.data?.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to setup 2FA",
      };
    }
  };

  // ================= 2FA ENABLE =================
  const enable2FA = async (token) => {
    try {
      const res = await api.post("/api/auth/2fa/enable", { token });
      return { success: true, data: res.data?.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to enable 2FA",
      };
    }
  };

  // ================= 2FA DISABLE =================
  const disable2FA = async (password, token) => {
    try {
      await api.post("/api/auth/2fa/disable", { password, token });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to disable 2FA",
      };
    }
  };

  // ================= 2FA STATUS =================
  const get2FAStatus = async () => {
    try {
      const res = await api.get("/api/auth/2fa/status");
      return { success: true, data: res.data?.data };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to get 2FA status",
      };
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      await api.get("/api/auth/signout");
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      socket.disconnect();
      dispatch(logoutUser());
      navigate("/");
    }
  };

  // ================= GET CURRENT USER =================
  const getCurrentUser = useCallback(async () => {
    // Guard: during active Google popup login, /me may 401 briefly.
    // We must not purge auth state while login is inflight.
    const googleInFlight = typeof window !== "undefined" && window.__googleLoginInFlight;

    try {
      console.log("[AUTH ME] fetch start", { googleInFlight: Boolean(googleInFlight) });
      dispatch(setLoading(true));

      const res = await api.get("/api/auth/me", {
        withCredentials: true,
      });

      const userData = res.data?.data || res.data;

      dispatch(setUserData(userData));

      // Connect socket only after valid auth
      if (userData?._id) {
        if (!socket.connected) {
          socket.connect();
        }

        socket.emit("join", userData._id);

        console.log("✅ Socket joined room for user", userData._id);
      }
    } catch (err) {
      console.error("GET CURRENT USER ERROR:", err);

      // User not logged in yet
      // This is NORMAL on refresh before login
      if (err.response?.status === 401 || err.response?.status === 403) {
        // During Google login, cookie may not be persisted yet.
        // Avoid logging out/purging state while popup flow is still finishing.
        if (err.response?.status === 401 && googleInFlight) {
          console.log("[AUTH ME] 401 during google inflight; skipping logout", {
            googleInFlight: true,
          });
          return;
        }

        // Disconnect stale socket
        socket.disconnect();

        // Clear redux auth state
        dispatch(logoutUser());

        // Only show toast for banned/suspended users
        if (err.response?.status === 403) {
          const msg = err.response?.data?.message || "Your account has been suspended.";

          if (msg.toLowerCase().includes("suspended") || msg.toLowerCase().includes("banned")) {
            toast.error(msg, {
              duration: 8000,
            });
          }
        }

        // IMPORTANT:
        // Don't show generic error for unauthenticated users
        return;
      }

      // Real server/network errors only
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      dispatch(setLoading(false));
      console.log("[AUTH ME] fetch end");
    }
  }, [dispatch]);

  // ================= SIGNUP SEND OTP =================
  const sendSignupOtp = async (data) => {
    try {
      await api.post("/api/auth/signup/send-otp", {
        ...data,
        skills: data.skills,
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message,
      };
    }
  };

  // ================= VERIFY OTP =================
  const verifySignupOtp = async (data) => {
    try {
      const formData = new FormData();

      formData.append("email", data.email);
      formData.append("otp", data.otp);

      const res = await api.post("/api/auth/signup/verify-otp", formData);

      dispatch(setUserData(res.data.data));

      if (res.data.data?._id) {
        if (!socket.connected) {
          socket.connect();
        }

        socket.emit("join", res.data.data._id);
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message,
      };
    }
  };

  // ================= UPDATE PROFILE =================
  const updateProfile = async (data) => {
    try {
      const formData = new FormData();

      if (data.fullName) formData.append("fullName", data.fullName);

      if (data.skills) {
        formData.append("skills", JSON.stringify(data.skills));
      }

      if (data.avatar) formData.append("avatar", data.avatar);

      if (data.coverImage) {
        formData.append("coverImage", data.coverImage);
      }

      const res = await api.put("/api/auth/profile", formData);

      dispatch(setUserData(res.data.data));

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message,
      };
    }
  };

  // ================= UPDATE SKILLS =================
  const updateSkills = async (skills) => {
    try {
      const res = await api.put("/api/auth/skills", {
        skills,
      });

      dispatch(setUserData(res.data.data));

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message,
      };
    }
  };

  // ================= PASSWORD RESET =================
  const sendResetOtp = async (data) => {
    try {
      await api.post("/api/auth/password/send-otp", data);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message,
      };
    }
  };

  const resetPassword = async (data) => {
    try {
      await api.post("/api/auth/password/reset", data);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message,
      };
    }
  };

  // ================= GOOGLE LOGIN =================
  const googleLogin = async () => {
    if (googleInFlight) {
      console.log("Google login already in progress");

      return {
        success: false,
        message: "Google login already in progress",
      };
    }

    googleInFlight = true;

    // Expose inflight state for getCurrentUser() race-condition guard.
    if (typeof window !== "undefined") {
      window.__googleLoginInFlight = true;
    }

    try {
      const result = await signInWithPopup(auth, provider);

      const firebaseUser = result.user;

      const res = await api.post("/api/auth/google", {
        fullName: firebaseUser.displayName,
        email: firebaseUser.email,
        avatar: firebaseUser.photoURL,
        deviceId: getDeviceId(),
      });

      const data = res.data;

      // 2FA required
      if (data?.requiresTwoFactor) {
        return {
          success: true,
          requiresTwoFactor: true,
          tempAuthToken: data.tempAuthToken,
          role: data.role,
          isSuperAdmin: data.isSuperAdmin,
        };
      }

      // Normal success
      if (data?.success) {
        dispatch(setUserData(data.user));

        if (data.user?._id) {
          if (!socket.connected) {
            socket.connect();
          }

          socket.emit("join", data.user._id);

          console.log("Socket joined after Google login");
        }

        return data;
      }

      return {
        success: false,
        message: "Google login failed",
      };
    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err);

      return {
        success: false,
        statusCode: err.response?.status,
        message: err.response?.data?.message || "Google login failed",
      };
    } finally {
      googleInFlight = false;
      if (typeof window !== "undefined") {
        window.__googleLoginInFlight = false;
      }
      console.log("[GOOGLE LOGIN] inflight=false");
    }
  };

  // ================= TIME TRACK =================
  const updateTimeSpent = async (minutes) => {
    try {
      const res = await api.post("/api/xp/time", {
        minutes,
      });

      dispatch(setUserData(res.data));

      return { success: true };
    } catch (err) {
      return { success: false };
    }
  };

  // ================= RETURN =================
  return {
    user,
    loading,
    login,
    logout,
    getCurrentUser,
    sendSignupOtp,
    verifySignupOtp,
    updateProfile,
    updateSkills,
    sendResetOtp,
    resetPassword,
    googleLogin,
    updateTimeSpent,
    verify2FA,
    setup2FA,
    enable2FA,
    disable2FA,
    get2FAStatus,
  };
};

export default useAuth;
