import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Sun, Moon, ArrowLeft, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import AuthLayout from "../components/AuthLayout";
import useAuth from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(Array(4).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputsRef = useRef([]);

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
          {/* BACK LINK */}
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>

          {/* LOGO */}
          <div className="flex justify-center">
            <img
              src="https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png"
              alt="PlaceMentor"
              className="w-14 h-14 rounded-xl border border-border shadow-subtle"
            />
          </div>

          {/* HEADING */}
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text">Reset Password</h2>
            <p className="text-xs text-text-muted mt-1">
              Enter OTP and create your new password
            </p>
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs font-medium text-text block mb-1">Account Email</label>
            <Input
              value={email}
              disabled
              className="h-10 bg-surface-2 border-border text-text-muted rounded-lg opacity-80"
            />
          </div>

          {/* OTP */}
          <div>
            <label className="text-xs font-medium text-text block mb-1">4-Digit Code</label>
            <div onPaste={handlePaste} className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputsRef.current[index] = el)}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg text-center text-xl font-bold bg-surface-2 border border-border text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                />
              ))}
            </div>
          </div>

          {/* PASSWORD */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text block">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-10 pr-10 bg-surface-2 border-border text-text placeholder:text-text-subtle rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-text-subtle hover:text-text cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleReset}
            disabled={loading}
            className="w-full h-10 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm shadow-soft transition cursor-pointer"
          >
            <LockKeyhole className="w-4 h-4 mr-2" />
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </div>
      </AuthLayout>
    </>
  );
}

/* FULL LOADER */
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-surface border border-border px-8 py-6 rounded-xl shadow-card text-center">
        <div className="w-9 h-9 mx-auto border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs font-medium text-text-muted">Resetting password...</p>
      </div>
    </div>
  );
}
