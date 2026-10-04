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
import useTheme from "../hooks/useTheme";

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
  const { isDark, toggleTheme } = useTheme();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-subtle animate-in zoom-in-95 duration-200">
            <div className="h-1.5 w-full bg-danger" />
            <button
              onClick={() => setBanPopup("")}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-surface-2 transition text-text-subtle hover:text-text cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-danger-soft">
                <ShieldAlert className="h-8 w-8 text-danger" />
              </div>
              <h2 className="text-2xl font-bold text-text">
                Account Suspended
              </h2>
              <p className="mt-1.5 text-sm text-text-muted">
                Access has been restricted temporarily.
              </p>
              <div className="mt-5 rounded-lg bg-surface-2 border border-border p-4 text-left">
                <p className="text-sm leading-relaxed text-text whitespace-pre-wrap">
                  {banPopup}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
                <Button
                  onClick={handleContactAdmin}
                  className="h-10 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm shadow-soft"
                >
                  <Mail className="w-4 h-4 mr-2" /> Contact Admin
                </Button>
                <Button
                  onClick={() => setBanPopup("")}
                  variant="outline"
                  className="h-10 rounded-lg border-border text-text hover:bg-surface-2 text-sm"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}{" "}
      {/* THEME TOGGLE */}
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

      <div className="w-full space-y-4">
        {twoFactorMode ? (
          <>
            {/* 2FA CHALLENGE UI */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-xl bg-accent-soft text-accent flex items-center justify-center">
                <Shield className="w-7 h-7 text-accent" />
              </div>
              <h2 className="mt-3 text-2xl font-bold text-text">
                Two-Factor Authentication
              </h2>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isSuperAdmin2FA
                      ? "bg-accent-soft text-accent"
                      : twoFactorRole === "admin"
                        ? "bg-primary-soft text-primary"
                        : "bg-success-soft text-success"
                  }`}
                >
                  {isSuperAdmin2FA ? "SUPER ADMIN" : twoFactorRole?.toUpperCase()}
                </span>
              </div>
              {isSuperAdmin2FA && (
                <p className="mt-2 text-xs text-accent font-medium text-center">
                  High privilege account security verification required.
                </p>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                  {useRecoveryCode ? (
                    <KeyRound className="w-3.5 h-3.5" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5" />
                  )}
                  {useRecoveryCode ? "Recovery Code" : "Authenticator Code"}
                </label>
                <button
                  onClick={() => setUseRecoveryCode(!useRecoveryCode)}
                  className="text-xs text-primary hover:text-primary-hover hover:underline"
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
                className="h-10 rounded-lg bg-surface border border-border text-center text-lg tracking-widest font-mono text-text"
                maxLength={useRecoveryCode ? 8 : 6}
              />
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="remember"
                  checked={rememberDevice}
                  onCheckedChange={(checked) => setRememberDevice(!!checked)}
                />
                <label
                  htmlFor="remember"
                  className="text-xs text-text-muted cursor-pointer"
                >
                  Remember this browser for 7 days
                </label>
              </div>
            </div>

            <Button
              onClick={handleVerify2FA}
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm shadow-soft cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </Button>

            <button
              onClick={handleBackToLogin}
              className="w-full text-xs text-text-muted hover:text-text transition-colors text-center cursor-pointer"
            >
              ← Back to login
            </button>
          </>
        ) : (
          <>
            {/* NORMAL LOGIN UI */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-sm tracking-wider">
                PM
              </div>
              <h2 className="mt-3 text-2xl font-bold text-text">
                Welcome Back
              </h2>
              <p className="mt-1 text-xs text-text-muted">
                Sign in to continue your placement preparation
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Input
                data-private
                type="email"
                placeholder="Enter email"
                className="h-10 rounded-lg bg-surface border border-border text-text text-sm"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <div className="relative">
                <Input
                  data-private
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="h-10 rounded-lg bg-surface border border-border text-text text-sm pr-10"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 cursor-pointer text-text-subtle hover:text-text"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:text-primary-hover hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-10 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm shadow-soft cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative text-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <span className="relative px-3 text-xs bg-surface text-text-subtle">
                OR
              </span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full h-10 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text flex items-center justify-center gap-2.5 text-xs font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            <p className="text-xs text-center text-text-muted pt-2">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="font-semibold text-primary hover:text-primary-hover hover:underline"
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
