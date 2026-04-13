import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(Array(4).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      toast.error("Session expired");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

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

    newOtp.forEach((val, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = val;
      }
    });
  };

  const handleReset = async () => {
    const finalOtp = otp.join("");

    if (!email || finalOtp.length !== 4 || !newPassword) {
      return toast.warning("All fields are required ❗");
    }

    setLoading(true);

    try {
      const res = await resetPassword({
        email,
        otp: finalOtp,
        newPassword,
      });

      if (res.success) {
        toast.success("Password Reset Successful 🎉");
        navigate("/login");
      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <FullScreenLoader />}

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

      <div className="min-h-screen flex items-center justify-center 
        bg-gradient-to-br from-white via-orange-50 to-blue-50 
        dark:from-gray-900 dark:via-gray-900 dark:to-gray-950
        px-4"
      >
        <div className="w-full max-w-md 
          bg-white dark:bg-gray-900 
          rounded-2xl shadow-lg p-6 space-y-6 border 
          border-gray-200 dark:border-gray-700
        ">

          {/* BACK */}
          <p
            onClick={() => navigate("/login")}
            className="text-sm text-orange-500 cursor-pointer"
          >
            ← Back to login
          </p>

          {/* HEADING */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Enter OTP and new password
            </p>
          </div>

          {/* EMAIL */}
          <Input
            value={email}
            disabled
            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500"
          />

          {/* OTP */}
          <div onPaste={handlePaste} className="flex gap-3 justify-between">
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

          {/* PASSWORD */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white pr-10"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>

        </div>
      </div>
    </>
  );
}

// 🔄 LOADER
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-sm">Resetting password...</p>
      </div>
    </div>
  );
}