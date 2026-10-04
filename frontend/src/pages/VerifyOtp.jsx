import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, ShieldCheck, Mail } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { useTheme } from "../hooks/useTheme";

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
  const { isDark, toggleTheme } = useTheme();

  const { email, fullName, password, skills, avatar, coverImage } = state || {};

  const [otp, setOtp] = useState(Array(4).fill(""));
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);

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
        {/* THEME TOGGLE BUTTON */}
        <div className="absolute top-5 right-5 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg border border-border bg-surface text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-text-muted" />}
          </Button>
        </div>

        {/* CARD */}
        <div className="w-full max-w-md mx-auto space-y-5 bg-surface border border-border p-6 sm:p-7 rounded-xl shadow-subtle">
          {/* LOGO */}
          <div className="flex justify-center">
            <img
              src="https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png"
              alt="PlaceMentor"
              className="w-14 h-14 rounded-xl border border-border shadow-subtle"
            />
          </div>

          {/* TITLE */}
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text">Verify Email</h2>
            <p className="text-xs text-text-muted mt-1">
              Enter the 4-digit code sent to your email
            </p>
          </div>

          {/* EMAIL DISPLAY */}
          <div className="flex justify-center">
            <span
              data-private
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-medium"
            >
              <Mail className="w-3.5 h-3.5" />
              {email}
            </span>
          </div>

          {/* OTP INPUT BOXES */}
          <div className="flex justify-center gap-3 py-1" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                data-private
                key={index}
                maxLength={1}
                value={digit}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold rounded-lg bg-surface-2 border border-border text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              />
            ))}
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full h-10 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm shadow-soft transition cursor-pointer"
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
          <p className="text-center text-xs text-text-muted">
            Didn’t receive code?{" "}
            <span className="font-semibold text-primary hover:text-primary-hover hover:underline cursor-pointer">
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
    <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
  );
}

/* FULLSCREEN LOADER */
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-surface border border-border px-8 py-6 rounded-xl shadow-card text-center">
        <div className="w-9 h-9 mx-auto border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs font-medium text-text-muted">Verifying OTP...</p>
      </div>
    </div>
  );
}
