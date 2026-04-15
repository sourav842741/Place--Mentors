import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "../services/api";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { email, fullName, password, skills, avatar, coverImage } =
    state || {};

  const [otp, setOtp] = useState(Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const inputsRef = useRef([]);

  // ✅ LOAD THEME
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

  // ✅ TOGGLE THEME
  const toggleTheme = () => {
    const isNowDark = document.documentElement.classList.toggle("dark");
    setIsDark(isNowDark);
    localStorage.setItem("theme", isNowDark ? "dark" : "light");
  };

  useEffect(() => {
    if (!email) {
      toast.error("Session expired ❌");
      navigate("/signup");
    }
  }, [email, navigate]);

  // ================= INPUT CHANGE =================
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // ================= BACKSPACE =================
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // ================= PASTE =================
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.split("");
    setOtp(newOtp);

    newOtp.forEach((val, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = val;
      }
    });
  };

  // ================= VERIFY =================
  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4) {
      return toast.warning("Enter valid OTP ❗");
    }

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
        dispatch(setUserData(res.data.data));
        toast.success("Signup Successful 🎉");
         navigate("/splash");
      } else {
        toast.error(res.data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* LOADER */}
      {loading && <FullScreenLoader />}

      <AuthLayout>

        {/* 🌙 THEME BUTTON */}
        <div className="absolute top-5 right-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            {isDark ? <Sun /> : <Moon />}
          </Button>
        </div>

        <div className="w-full max-w-md mx-auto space-y-6 
          bg-white dark:bg-gray-900 
          p-6 rounded-2xl shadow-md border 
          border-gray-200 dark:border-gray-700
        ">

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Verify Email
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter the 4-digit OTP sent to your email
          </p>

          {/* OTP */}
          <div className="flex justify-between gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                maxLength={1}
                value={digit}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-14 text-center text-lg rounded-xl 
                bg-gray-100 dark:bg-gray-800 
                text-black dark:text-white 
                border border-gray-300 dark:border-gray-700 
                focus:border-orange-500 focus:outline-none transition"
              />
            ))}
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

        </div>
      </AuthLayout>
    </>
  );
}

// 🔄 Spinner
function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  );
}

// 🔄 Full Loader
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-sm">Verifying OTP...</p>
      </div>
    </div>
  );
}