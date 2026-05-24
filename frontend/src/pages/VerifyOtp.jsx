import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, ShieldCheck } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

import {
  safeTrack,
  startCriticalReplay,
  stopReplaySuccess,
  safeSetUserFromState,
} from "../observability/openreplay/events";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { email, fullName, password, skills, avatar, coverImage } = state || {};

  const [otp, setOtp] = useState(Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const inputsRef = useRef([]);

  /* THEME LOAD */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  /* THEME TOGGLE */
  const toggleTheme = () => {
    const isNowDark = document.documentElement.classList.toggle("dark");
    setIsDark(isNowDark);
    localStorage.setItem("theme", isNowDark ? "dark" : "light");
  };

  useEffect(() => {
    if (!email) {
      safeTrack("signup_otp_session_expired", {});
      toast.error("Session expired ❌");
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    safeTrack("signup_otp_input", {
      digitIndex: index,
    });

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.split("");
    setOtp(newOtp);
    safeTrack("signup_otp_pasted", {});

    newOtp.forEach((val, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = val;
      }
    });
  };

  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4) {
      return toast.warning("Enter valid OTP ❗");
    }
    safeTrack("signup_verify_otp_clicked", {});

    startCriticalReplay("auth_2fa", {
      type: "signup_otp",
    });
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("email", email);
      formData.append("otp", finalOtp);
      formData.append("fullName", fullName);
      formData.append("password", password);
      formData.append("skills", JSON.stringify(skills));

      if (avatar) formData.append("avatar", avatar);
      if (coverImage) formData.append("coverImage", coverImage);

      const res = await api.post("/api/auth/signup/verify-otp", formData);

      if (res.data.success) {
        safeTrack("signup_verify_otp_success", {});

        safeSetUserFromState(res.data.data);

        stopReplaySuccess("auth_2fa");
        dispatch(setUserData(res.data.data));
        toast.success("Signup Successful 🎉");
        navigate("/splash");
      } else {
        safeTrack("signup_verify_otp_failed", {
          error: res?.data?.message,
        });

        startCriticalReplay("auth_2fa_failed", {
          error: res?.data?.message,
        });
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch {
      safeTrack("signup_verify_otp_failed", {
        error: "otp_verify_exception",
      });

      startCriticalReplay("auth_2fa_failed", {
        error: "otp_verify_exception",
      });
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <FullScreenLoader />}

      <AuthLayout>
        {/* THEME BUTTON */}
        <div className="absolute top-5 right-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>

        {/* CARD */}
        <div
          className="w-full max-w-md mx-auto space-y-6
          bg-white dark:bg-gray-900
          p-6 rounded-2xl shadow-xl border
          border-gray-200 dark:border-white/10"
        >
          {/* LOGO */}
          <div className="flex justify-center">
            <img
              src="https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png"
              alt="PlaceMentor"
              className="w-20 h-20 rounded-2xl shadow-lg"
            />
          </div>

          {/* TITLE */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Email</h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Enter the 4-digit OTP sent to your email
            </p>
          </div>

          {/* EMAIL SHOW */}
          <div
            data-private
            className="text-center text-sm text-blue-600 dark:text-blue-400 font-medium"
          >
            {email}
          </div>

          {/* OTP BOXES */}
          <div className="flex justify-between gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                data-private
                key={index}
                maxLength={1}
                value={digit}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-14 text-center text-xl font-semibold rounded-xl
                bg-gray-100 dark:bg-gray-800
                border border-gray-300 dark:border-gray-700
                text-gray-900 dark:text-white
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                outline-none transition"
              />
            ))}
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white h-11"
          >
            {loading ? (
              <>
                <Spinner />
                <span className="ml-2">Verifying...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verify OTP
              </>
            )}
          </Button>

          {/* RESEND TEXT */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Didn’t receive code?{" "}
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
              Resend
            </span>
          </p>
        </div>
      </AuthLayout>
    </>
  );
}

/* SPINNER */
function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
  );
}

/* FULLSCREEN LOADER */
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 px-8 py-6 rounded-2xl shadow-2xl text-center">
        <div className="w-10 h-10 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">Verifying OTP...</p>
      </div>
    </div>
  );
}
