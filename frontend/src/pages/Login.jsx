import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldAlert,
  Mail,
  X,
} from "lucide-react";
import { toast } from "sonner";

import useAuth from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const user = useSelector((state) => state.user.user);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [banPopup, setBanPopup] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  /* ===============================
     LOAD THEME
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
    const isNowDark = document.documentElement.classList.toggle("dark");
    setIsDark(isNowDark);
    localStorage.setItem("theme", isNowDark ? "dark" : "light");
  };

  /* ===============================
     CONTACT ADMIN CLICK HANDLER
  ================================= */
  const handleContactAdmin = () => {
  const subject = encodeURIComponent("Account Suspended Support");
  const body = encodeURIComponent(
    "Hello Admin,\n\nI need help with my account."
  );

  const gmailUrl =
    `https://mail.google.com/mail/?view=cm&fs=1&to=souravkumar85055@gmail.com&su=${subject}&body=${body}`;

  window.open(gmailUrl, "_blank");
};

  /* ===============================
     LOGIN
  ================================= */
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      return toast.warning("Please enter email and password");
    }

    setLoading(true);

    try {
      const res = await login(form);

      if (res?.success) {
        toast.success("Welcome back 🎉");

        const user = res?.data;

        if (!user) {
          toast.error("Invalid server response");
          return;
        }

        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/splash");
        }
      } else {
        const msg = res?.message || "Login failed";

        /* if backend returns blocked msg without throwing */
        if (res?.statusCode === 403 || msg.toLowerCase().includes("banned") || msg.toLowerCase().includes("suspended")) {
          setBanPopup(msg);
        } else {
          toast.error(msg);
        }
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Something went wrong";

      /* banned user popup */
      if (error?.response?.status === 403 || msg.toLowerCase().includes("banned") || msg.toLowerCase().includes("suspended")) {
        setBanPopup(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     GOOGLE LOGIN
  ================================= */
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      const res = await googleLogin();

      if (res.success) {
        toast.success("Google login successful 🚀");
        window.location.reload();
      } else {
        const msg = res.message || "Google login failed";
        if (res?.statusCode === 403 || msg.toLowerCase().includes("banned") || msg.toLowerCase().includes("suspended")) {
          setBanPopup(msg);
        } else {
          toast.error(msg);
        }
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>

      {/* ===============================
          PREMIUM BANNED USER POPUP
      ================================= */}
      {banPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-md sm:max-w-xl overflow-hidden rounded-3xl border border-red-200/50 dark:border-red-500/30 bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-900/80 dark:to-gray-800/80 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Glowing animated top border */}
            <div className="h-3 w-full bg-gradient-to-r from-red-500 via-orange-500/80 to-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.4)] animate-pulse-glow" />

            <div className="p-8 text-center">

              {/* Pulsing floating icon */}
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-100/80 to-orange-100/80 dark:from-red-500/10 dark:to-orange-500/10 shadow-2xl border border-red-200/50 dark:border-red-500/30 animate-bounce-subtle">
                <ShieldAlert className="h-14 w-14 text-red-500 drop-shadow-lg animate-pulse" />
              </div>

              {/* Premium title */}
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-100 bg-clip-text text-transparent mb-2 tracking-tight">
                Account Suspended
              </h2>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-medium mb-6 max-w-md mx-auto leading-relaxed">
                Your access has been temporarily restricted.
              </p>

              {/* Backend reason message card */}
              <div className="mx-auto max-w-md rounded-2xl border border-gray-200/50 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/50 backdrop-blur-lg shadow-xl p-6 mb-8">
                <p className="text-sm sm:text-base leading-7 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words font-medium">
                  {banPopup}
                </p>
              </div>

              {/* Support info */}
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium mb-8 px-4 max-w-sm mx-auto leading-relaxed">
                Need assistance? Contact admin below.
              </p>

              {/* Premium responsive buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mx-auto">
                <Button
                  onClick={handleContactAdmin}
                  size="lg"
                  className="group rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-semibold h-14 flex items-center gap-2"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Contact Admin
                </Button>

                <Button
                  onClick={() => setBanPopup("")}
                  variant="destructive"
                  size="lg"
                  className="group rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 font-semibold h-14 flex items-center gap-2"
                >
                  <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===============================
          THEME TOGGLE
      ================================= */}
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

      {/* ===============================
          LOGIN CARD (UNCHANGED)
      ================================= */}
      <div className="w-full max-w-md space-y-5 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Sign in
        </h2>

        {/* Email */}
        <Input
          placeholder="Email"
          className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* Password */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white pr-10"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500 dark:text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {/* Forgot */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-orange-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Login */}
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-black dark:text-white py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        {/* Signup */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-orange-500 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

