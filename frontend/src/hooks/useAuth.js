import { useDispatch } from "react-redux";
import { setUserData, logoutUser, setLoading } from "../redux/userSlice";
import api from "../services/api";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";

import { useNavigate } from "react-router-dom";




const useAuth = () => {
  const dispatch = useDispatch();
    const navigate = useNavigate();

  // ================= LOGIN =================
  const login = async (form) => {
    try {
      const res = await api.post("/api/auth/signin", form);
      dispatch(setUserData(res.data.data));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  // ================= LOGOUT =================
 const logout = async () => {
  await api.get("/api/auth/signout");
  dispatch(logoutUser());
  navigate("/");
};

  // ================= GET CURRENT USER =================
 const getCurrentUser = async () => {
  try {
    dispatch(setLoading(true));

    const res = await api.get("/api/auth/me", {
      withCredentials: true, 
    });

    dispatch(setUserData(res.data.data));

  } catch {
    dispatch(logoutUser());
  } finally {
    dispatch(setLoading(false));
  }
};

  // ================= SIGNUP SEND OTP =================
  const sendSignupOtp = async (data) => {
    try {
      await api.post("/api/auth/signup/send-otp", {
        ...data,
        skills: data.skills.split(","),
      });

      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  // ================= VERIFY OTP =================
  const verifySignupOtp = async (data) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("otp", data.otp);

      const res = await api.post(
        "/api/auth/signup/verify-otp",
        formData
      );

      dispatch(setUserData(res.data.data));

      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  // ================= UPDATE PROFILE =================
  const updateProfile = async (data) => {
    try {
      const formData = new FormData();

      if (data.fullName) formData.append("fullName", data.fullName);
      if (data.skills)
        formData.append("skills", JSON.stringify(data.skills));

      if (data.avatar) formData.append("avatar", data.avatar);
      if (data.coverImage) formData.append("coverImage", data.coverImage);

      const res = await api.put("/api/auth/profile", formData);

      dispatch(setUserData(res.data.data));

      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  // ================= UPDATE SKILLS =================
  const updateSkills = async (skills) => {
    try {
      const res = await api.put("/api/auth/skills", { skills });

      dispatch(setUserData(res.data.data));

      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  // ================= PASSWORD RESET =================
const sendResetOtp = async (data) => {
  try {
    await api.post("/api/auth/password/send-otp", data);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message };
  }
};

  const resetPassword = async (data) => {
    try {
      await api.post("/api/auth/password/reset", data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  };

  // ================= GOOGLE AUTH =================
 const googleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const res = await api.post("/api/auth/google", {
      fullName: user.displayName,
      email: user.email,
      avatar: user.photoURL,
    });

    if (res.data.success) {
      dispatch(setUserData(res.data.user)); 
      navigate("/dashboard");
      return { success: true };
    }

  } catch (err) {
    console.log(err);
    return { success: false, message: "Google login failed" };
  }
};

// ================= TIME TRACK =================
const updateTimeSpent = async (minutes) => {
  try {
    const res = await api.post("/api/xp/time", { minutes });

    //  IMPORTANT: Redux update
    dispatch(setUserData(res.data));

    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

  // ================= RETURN ALL =================
  return {
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
  };
};

export default useAuth;