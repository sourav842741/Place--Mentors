import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  ArrowLeft,
  Mail,
  SendHorizonal,
} from "lucide-react";

import useAuth from "../hooks/useAuth";
import { toast } from "sonner";

export default function ForgotPassword() {
  const { sendResetOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  /* LOAD THEME */
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

  /* TOGGLE THEME */
  const toggleTheme = () => {
    const nowDark = document.documentElement.classList.toggle("dark");

    setIsDark(nowDark);
    localStorage.setItem("theme", nowDark ? "dark" : "light");
  };

  /* SEND OTP */
  const handleSendOtp = async () => {
    if (!email) {
      return toast.warning("Please enter your email");
    }

    setLoading(true);

    try {
      const res = await sendResetOtp({ email });

      if (res.success) {
        toast.success("OTP sent to your email 📩");

        navigate("/reset-password", {
          state: { email },
        });
      } else {
        toast.error(res.message || "Failed to send OTP");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <FullScreenLoader />}

      <div
        className="min-h-screen flex items-center justify-center px-4 relative
        bg-gradient-to-br from-slate-50 via-white to-indigo-50
        dark:from-gray-950 dark:via-gray-900 dark:to-black transition-colors duration-300"
      >
        {/* THEME BUTTON */}
        <div className="absolute top-5 right-5 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </Button>
        </div>

        {/* CARD */}
        <div
          className="w-full max-w-md rounded-3xl p-7 space-y-6
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
          border border-gray-200 dark:border-white/10 shadow-2xl"
        >
          {/* LOGO */}
          <div className="flex justify-center">
            <img
              src="https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png"
              alt="PlaceMentor"
              className="w-20 h-20 rounded-2xl shadow-lg"
            />
          </div>

          {/* BACK */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>

          {/* TITLE */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Forgot Password
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Enter your email to receive reset OTP
            </p>
          </div>

          {/* INPUT */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />

            <Input
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pl-10 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
            />
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold shadow-lg"
          >
            <SendHorizonal className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send OTP"}
          </Button>

          {/* FOOT TEXT */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            Secure password recovery for your account
          </p>
        </div>
      </div>
    </>
  );
}

/* FULLSCREEN LOADER */
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl px-8 py-6 shadow-2xl text-center">
        <div className="w-10 h-10 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          Sending OTP...
        </p>
      </div>
    </div>
  );
}