import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import useAuth from "../hooks/useAuth";
import { toast } from "sonner";

export default function ForgotPassword() {
  const { sendResetOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  /* ===============================
     LOAD THEME ON REFRESH
  ================================= */
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

  /* ===============================
     TOGGLE THEME
  ================================= */
  const toggleTheme = () => {
    const nowDark = document.documentElement.classList.toggle("dark");

    setIsDark(nowDark);
    localStorage.setItem("theme", nowDark ? "dark" : "light");
  };

  /* ===============================
     SEND OTP
  ================================= */
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
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <FullScreenLoader isDark={isDark} />}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-orange-50 to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 transition-colors duration-300">

        {/* THEME TOGGLE */}
        <div className="absolute top-5 right-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700" />
            )}
          </Button>
        </div>

        {/* CARD */}
        <div className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 border border-white/40 dark:border-gray-800 transition-all duration-300">

          {/* BACK */}
          <p
            onClick={() => navigate("/login")}
            className="text-sm text-orange-500 hover:text-orange-600 font-medium cursor-pointer w-fit"
          >
            ← Back to login
          </p>

          {/* HEADING */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Forgot Password
            </h2>

            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Enter your email to receive OTP
            </p>
          </div>

          {/* INPUT */}
          <Input
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-orange-500"
          />

          {/* BUTTON */}
          <Button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg"
          >
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </div>
      </div>
    </>
  );
}

/* ===============================
   FULL SCREEN LOADER
================================= */
function FullScreenLoader({ isDark }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl px-6 py-5 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>

        <p className="text-sm text-gray-700 dark:text-gray-300">
          Sending OTP...
        </p>
      </div>
    </div>
  );
}