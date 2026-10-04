import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ArrowLeft, Mail, SendHorizonal } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import useAuth from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { toast } from "sonner";

export default function ForgotPassword() {
  const { sendResetOtp } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

          {/* TITLE */}
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-text">Forgot Password</h2>
            <p className="text-xs text-text-muted mt-1">
              Enter your email to receive a password reset OTP
            </p>
          </div>

          {/* INPUT */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-text block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-text-subtle w-4 h-4" />
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 pl-9 bg-surface-2 border-border text-text placeholder:text-text-subtle rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full h-10 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm shadow-soft transition cursor-pointer"
          >
            <SendHorizonal className="w-4 h-4 mr-2" />
            {loading ? "Sending..." : "Send OTP"}
          </Button>

          {/* FOOT TEXT */}
          <p className="text-center text-xs text-text-muted pt-1">
            Secure password recovery for your account
          </p>
        </div>
      </AuthLayout>
    </>
  );
}

/* FULLSCREEN LOADER */
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
      <div className="bg-surface border border-border rounded-xl px-8 py-6 shadow-card text-center">
        <div className="w-9 h-9 mx-auto border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs font-medium text-text-muted">Sending OTP...</p>
      </div>
    </div>
  );
}
