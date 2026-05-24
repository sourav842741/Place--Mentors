import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Sun,
  Moon,
  ShieldAlert,
  Mail,
  X,
  Shield,
  KeyRound,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

import useAuth from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";

import {
  safeTrack,
  startCriticalReplay,
  stopReplaySuccess,
  safeSetUserFromState,
} from "../observability/openreplay/events";

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin, verify2FA } = useAuth();
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

  // 2FA state
  const [twoFactorMode, setTwoFactorMode] = useState(false);
  const [tempAuthToken, setTempAuthToken] = useState("");
  const [twoFactorRole, setTwoFactorRole] = useState("");
  const [isSuperAdmin2FA, setIsSuperAdmin2FA] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);

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
    const body = encodeURIComponent("Hello Admin,\n\nI need help with my account.");

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=souravkumar85055@gmail.com&su=${subject}&body=${body}`;

    window.open(gmailUrl, "_blank");
  };

  /* ===============================
     LOGIN
  ================================= */
  const handleLogin = async () => {
    if (!form.email || !form.password) {
      return toast.warning("Please enter email and password");
    }

    safeTrack("login_clicked", { method: "email" });
    startCriticalReplay("auth_login", { method: "email" });

    setLoading(true);

    try {
      const res = await login(form);

      if (res?.requiresTwoFactor) {
        setTwoFactorMode(true);
        setTempAuthToken(res.tempAuthToken);
        setTwoFactorRole(res.role);
        setIsSuperAdmin2FA(res.isSuperAdmin);
        setOtpToken("");
        toast.info("Two-factor authentication required");
        return;
      }

      if (res?.success) {
        toast.success("Welcome back 🎉");

        const user = res?.data;

        safeTrack("login_success", {
          role: user?.role,
        });

        safeSetUserFromState(user);

        stopReplaySuccess("auth_login");

        if (!user) {
          toast.error("Invalid server response");
          return;
        }

        if (user.role === "admin" || user.role === "superadmin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/splash");
        }
      } else {
        const msg = res?.message || "Login failed";

        safeTrack("login_failed", {
          statusCode: res?.statusCode,
        });

        startCriticalReplay("auth_login", {
          statusCode: res?.statusCode,
        });

        if (
          res?.statusCode === 403 ||
          msg.toLowerCase().includes("banned") ||
          msg.toLowerCase().includes("suspended")
        ) {
          setBanPopup(msg);
        } else {
          toast.error(msg);
        }
      }
    } catch (error) {
      safeTrack("login_failed", {
        statusCode: error?.response?.status,
      });

      startCriticalReplay("auth_login", {
        statusCode: error?.response?.status,
      });
      const msg = error?.response?.data?.message || "Something went wrong";

      if (
        error?.response?.status === 403 ||
        msg.toLowerCase().includes("banned") ||
        msg.toLowerCase().includes("suspended")
      ) {
        setBanPopup(msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     VERIFY 2FA
  ================================= */
  const handleVerify2FA = async () => {
    if (!otpToken) {
      return toast.warning("Please enter the code");
    }

    safeTrack("2fa_verify_clicked", {
      method: useRecoveryCode ? "recovery" : "totp",
    });

    startCriticalReplay("auth_2fa", {
      method: useRecoveryCode ? "recovery" : "totp",
    });

    setLoading(true);

    try {
      const res = await verify2FA(tempAuthToken, otpToken, rememberDevice);

      if (res?.success) {
        toast.success("Authentication successful 🎉");

        const data = res?.data;
        safeTrack("2fa_verify_success", {
          role: data?.role,
        });

        safeSetUserFromState(data);

        stopReplaySuccess("auth_2fa");

        if (data?.usedRecoveryCode) {
          toast.warning("Recovery code used. Please generate new codes in security settings.");
        }

        if (data?.role === "admin" || data?.role === "superadmin" || data?.isSuperAdmin) {
          navigate("/admin/dashboard");
        } else {
          navigate("/splash");
        }
      } else {
        safeTrack("2fa_verify_failed", {
          statusCode: res?.statusCode,
        });

        startCriticalReplay("auth_2fa_failed", {
          statusCode: res?.statusCode,
        });

        toast.error(res?.message || "Invalid code");
      }
    } catch (error) {
      safeTrack("2fa_verify_failed", {
        statusCode: error?.response?.status,
      });

      startCriticalReplay("auth_2fa_failed", {
        statusCode: error?.response?.status,
      });
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setTwoFactorMode(false);
    setTempAuthToken("");
    setOtpToken("");
    setRememberDevice(false);
    setUseRecoveryCode(false);
  };

  /* ===============================
     GOOGLE LOGIN
  ================================= */
  const handleGoogleLogin = async () => {
    if (googleLoading || loading) return; // prevent duplicate clicks
    safeTrack("google_auth_clicked", {});

    startCriticalReplay("auth_google", {});
    setGoogleLoading(true);

    try {
      const res = await googleLogin();

      //  If banned / suspended
      const msg = res?.message || "Google login failed";

      if (
        res?.statusCode === 403 ||
        msg.toLowerCase().includes("banned") ||
        msg.toLowerCase().includes("suspended")
      ) {
        setBanPopup(msg);
        return;
      }

      //  If 2FA required (Admin / Super Admin)
      if (res?.requiresTwoFactor) {
        safeTrack("2fa_required", {
          role: res?.role,
          isSuperAdmin: !!res?.isSuperAdmin,
        });

        startCriticalReplay("auth_2fa", {
          role: res?.role,
        });

        startCriticalReplay("auth_2fa", {
          role: res?.role,
        });
        setTwoFactorMode(true);
        setTempAuthToken(res.tempAuthToken);
        setTwoFactorRole(res.role);
        setIsSuperAdmin2FA(res.isSuperAdmin);
        setOtpToken("");
        toast.info("Two-factor authentication required");
        return;
      }

      //  Successful login
      if (res?.success) {
        toast.success("Google login successful 🚀");

        const user = res?.user;

        safeTrack("google_auth_success", {
          role: user?.role,
        });

        safeSetUserFromState(user);

        stopReplaySuccess("auth_google");

        if (user?.role === "admin" || user?.isSuperAdmin) {
          navigate("/admin/dashboard");
        } else {
          navigate("/splash");
        }

        return;
      }

      //  Other errors
      safeTrack("google_auth_failed", {
        statusCode: res?.statusCode,
      });

      startCriticalReplay("auth_google_failed", {
        statusCode: res?.statusCode,
      });
      toast.error(msg);
    } catch (error) {
      const status = error?.response?.status;
      const backendMsg = error?.response?.data?.message;

      // Firebase popup close/cancel handling
      const firebaseCode = error?.code;
      const firebaseMsg = error?.message;

      if (firebaseCode === "auth/popup-closed-by-user" || /popup closed/i.test(firebaseMsg || "")) {
        safeTrack("google_popup_closed", {});
        toast.error("Google sign-in popup closed.");
        return;
      }

      if (status) {
        safeTrack("google_auth_failed", {
          statusCode: status,
        });

        startCriticalReplay("auth_google_failed", {
          statusCode: status,
        });
        toast.error(backendMsg || `Google sign-in failed (HTTP ${status})`);
        return;
      }

      // axios/network error: request exists but no response
      if (error?.request && !error?.response) {
        toast.error(error?.message || "Network error while contacting auth server");
        return;
      }

      safeTrack("google_auth_failed", {
        error: error?.message,
      });

      startCriticalReplay("auth_google_failed", {
        error: error?.message,
      });
      toast.error(backendMsg || error?.message || "Something went wrong");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      {banPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          {" "}
          <div className="relative w-full max-w-lg overflow-hidden rounded-[28px] border border-white/20 dark:border-white/10 bg-white dark:bg-gray-900 shadow-2xl animate-in zoom-in-95 duration-300">
            {" "}
            {/* TOP GLOW */}{" "}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />{" "}
            {/* CLOSE */}{" "}
            <button
              onClick={() => setBanPopup("")}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {" "}
              <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />{" "}
            </button>{" "}
            <div className="p-8 text-center">
              {" "}
              {/* ICON */}{" "}
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-900/20">
                {" "}
                <ShieldAlert className="h-10 w-10 text-red-500" />{" "}
              </div>{" "}
              {/* TITLE */}{" "}
              <h2 className="text-3xl font-black text-gray-900 dark:text-white">
                {" "}
                Account Suspended{" "}
              </h2>{" "}
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {" "}
                Access has been restricted temporarily.{" "}
              </p>{" "}
              {/* REASON */}{" "}
              <div className="mt-6 rounded-2xl bg-gray-100 dark:bg-gray-800 p-5 text-left">
                {" "}
                <p className="text-sm leading-7 text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                  {" "}
                  {banPopup}{" "}
                </p>{" "}
              </div>{" "}
              {/* BUTTONS */}{" "}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {" "}
                <Button
                  onClick={handleContactAdmin}
                  className="h-12 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white"
                >
                  {" "}
                  <Mail className="w-4 h-4 mr-2" /> Contact Admin{" "}
                </Button>{" "}
                <Button
                  onClick={() => setBanPopup("")}
                  variant="outline"
                  className="h-12 rounded-2xl"
                >
                  {" "}
                  Close{" "}
                </Button>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      )}{" "}
      {/* ===============================        THEME TOGGLE    ================================= */}{" "}
      <div className="absolute top-5 right-5 z-20">
        {" "}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          {" "}
          {isDark ? <Sun /> : <Moon />}{" "}
        </Button>{" "}
      </div>{" "}
      {/* ===============================        LOGIN CARD / 2FA CHALLENGE    ================================= */}{" "}
      <div className="w-full max-w-md rounded-[28px] border border-white/20 dark:border-white/10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl p-7 space-y-5">
        {" "}
        {twoFactorMode ? (
          <>
            {/* 2FA CHALLENGE UI */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-gray-900 dark:text-white">
                Two-Factor Authentication
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    isSuperAdmin2FA
                      ? "bg-gradient-to-r from-purple-600 to-pink-600"
                      : twoFactorRole === "admin"
                        ? "bg-gradient-to-r from-orange-500 to-red-500"
                        : "bg-gradient-to-r from-emerald-500 to-teal-600"
                  }`}
                >
                  {isSuperAdmin2FA ? "SUPER ADMIN" : twoFactorRole?.toUpperCase()}
                </span>
              </div>
              {isSuperAdmin2FA && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-medium text-center">
                  High privilege account security verification required.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {useRecoveryCode ? (
                    <KeyRound className="w-4 h-4" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                  {useRecoveryCode ? "Recovery Code" : "Authenticator Code"}
                </label>
                <button
                  onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {useRecoveryCode ? "Use authenticator instead" : "Use recovery code"}
                </button>
              </div>
              <Input
                data-private
                type="text"
                placeholder={useRecoveryCode ? "8-character recovery code" : "6-digit code"}
                value={otpToken}
                onChange={(e) =>
                  setOtpToken(
                    useRecoveryCode
                      ? e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                      : e.target.value.replace(/\D/g, "")
                  )
                }
                className="h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 border-0 text-center text-lg tracking-widest font-mono"
                maxLength={useRecoveryCode ? 8 : 6}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberDevice}
                  onCheckedChange={(checked) => setRememberDevice(!!checked)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  Remember this browser for 7 days
                </label>
              </div>
            </div>

            <Button
              onClick={handleVerify2FA}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:opacity-90 text-white font-semibold"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </Button>

            <button
              onClick={handleBackToLogin}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              ← Back to login
            </button>
          </>
        ) : (
          <>
            {/* NORMAL LOGIN UI */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center shadow-lg">
                <img
                  src="https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png"
                  className="w-12 h-12"
                />
              </div>
              <h2 className="mt-4 text-3xl font-black text-gray-900 dark:text-white">
                Welcome Back 👋
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Sign in to continue your journey
              </p>
            </div>

            <Input
              data-private
              placeholder="Enter email"
              className="h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 border-0"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <div className="relative">
              <Input
                data-private
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 border-0 pr-10"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 cursor-pointer text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:opacity-90 text-white font-semibold"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t dark:border-gray-700"></div>
              </div>
              <span className="relative px-3 text-sm bg-white dark:bg-gray-900 text-gray-400">
                OR
              </span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full h-12 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />

              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
