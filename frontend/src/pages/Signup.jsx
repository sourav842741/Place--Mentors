import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Moon, Sun, Upload, ImageIcon, User } from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTheme } from "../hooks/useTheme";

import useAuth from "../hooks/useAuth";

import {
  safeTrack,
  startCriticalReplay,
  stopReplaySuccess,
} from "../observability/openreplay/events";

export default function Signup() {
  const navigate = useNavigate();
  const { googleLogin, sendSignupOtp } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    skills: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "avatar") {
      safeTrack("signup_avatar_selected", {
        hasAvatar: true,
      });
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      safeTrack("signup_cover_selected", {
        hasCover: true,
      });
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      return toast.warning("Please fill all required fields");
    }

    safeTrack("signup_clicked", {
      method: "email",
    });

    startCriticalReplay("auth_signup", {
      method: "email",
    });

    setLoading(true);

    try {
      const skillsArray = form.skills ? form.skills.split(",").map((s) => s.trim()) : [];

      const res = await sendSignupOtp({
        ...form,
        skills: skillsArray,
      });

      if (res.success) {
        safeTrack("signup_otp_sent", {
          hasAvatar: !!avatar,
          hasCover: !!coverImage,
        });

        stopReplaySuccess("auth_signup");
        toast.success("OTP sent 📩");

        navigate("/verify-otp", {
          state: { ...form, skills: skillsArray, avatar, coverImage },
        });
      } else {
        safeTrack("signup_failed", {
          error: res?.message,
        });

        startCriticalReplay("auth_signup_failed", {
          error: res?.message,
        });
        toast.error(res.message || "Signup failed");
      }
    } catch {
      safeTrack("signup_failed", {
        error: "signup_exception",
      });

      startCriticalReplay("auth_signup_failed", {
        error: "signup_exception",
      });
      toast.error("Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <div className="w-full max-w-md mx-auto space-y-4 bg-surface border border-border p-6 sm:p-7 rounded-xl shadow-subtle">
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
          <h2 className="text-2xl font-bold tracking-tight text-text">Create Account</h2>
          <p className="text-xs text-text-muted mt-1">
            Start your placement journey today with smart mentorship
          </p>
        </div>

        {/* FORM INPUTS */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-text mb-1 block">Full Name</label>
            <Input
              data-private
              name="fullName"
              placeholder="e.g. Rahul Sharma"
              value={form.fullName}
              onChange={handleChange}
              className="bg-surface-2 border-border text-text placeholder:text-text-subtle h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text mb-1 block">Email Address</label>
            <Input
              data-private
              type="email"
              name="email"
              placeholder="e.g. rahul@example.com"
              value={form.email}
              onChange={handleChange}
              className="bg-surface-2 border-border text-text placeholder:text-text-subtle h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text mb-1 block">Password</label>
            <Input
              data-private
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="bg-surface-2 border-border text-text placeholder:text-text-subtle h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text mb-1 block">Skills (Comma separated)</label>
            <Input
              data-private
              name="skills"
              placeholder="React, Java, DSA, Node.js"
              value={form.skills}
              onChange={handleChange}
              className="bg-surface-2 border-border text-text placeholder:text-text-subtle h-10 rounded-lg focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {/* AVATAR & COVER UPLOAD */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <label className="cursor-pointer block border border-dashed border-border hover:border-primary/50 hover:bg-surface-2 rounded-lg p-3 text-center transition">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-12 h-12 mx-auto rounded-full object-cover" />
              ) : (
                <div className="space-y-1">
                  <User className="mx-auto w-5 h-5 text-primary" />
                  <p className="text-[11px] font-medium text-text-muted">Avatar</p>
                </div>
              )}
              <input data-private type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, "avatar")} />
            </label>

            <label className="cursor-pointer block border border-dashed border-border hover:border-primary/50 hover:bg-surface-2 rounded-lg p-3 text-center transition">
              {coverPreview ? (
                <img src={coverPreview} alt="Cover" className="w-full h-12 object-cover rounded" />
              ) : (
                <div className="space-y-1">
                  <ImageIcon className="mx-auto w-5 h-5 text-accent" />
                  <p className="text-[11px] font-medium text-text-muted">Cover</p>
                </div>
              )}
              <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, "cover")} />
            </label>
          </div>
        </div>

        {/* SIGNUP BUTTON */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-10 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm shadow-soft transition cursor-pointer"
        >
          {loading ? "Creating..." : "Sign Up"}
        </Button>

        {/* OR DIVIDER */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-border" />
          <span className="absolute px-3 text-xs bg-surface text-text-subtle">OR</span>
        </div>

        {/* GOOGLE SIGNUP */}
        <button
          onClick={async () => {
            safeTrack("google_signup_clicked", {});
            startCriticalReplay("auth_google", {});
            const res = await googleLogin();

            if (res.success) {
              safeTrack("google_signup_success", {});
              stopReplaySuccess("auth_google");
              toast.success("Login successful");
              navigate("/splash");
            } else if (res.requiresTwoFactor) {
              safeTrack("2fa_required", {
                role: res?.role,
                isSuperAdmin: !!res?.isSuperAdmin,
              });
              startCriticalReplay("auth_2fa", {
                role: res?.role,
              });
              navigate("/verify-2fa", {
                state: {
                  tempAuthToken: res.tempAuthToken,
                  role: res.role,
                  isSuperAdmin: res.isSuperAdmin,
                },
              });
            } else {
              safeTrack("google_signup_failed", {
                error: res?.message,
              });
              startCriticalReplay("auth_google_failed", {
                error: res?.message,
              });
              toast.error(res.message || "Google login failed");
            }
          }}
          className="w-full h-10 rounded-lg border border-border bg-surface hover:bg-surface-2 text-text flex items-center justify-center gap-2.5 text-xs font-medium transition cursor-pointer"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
          Sign up with Google
        </button>

        {/* LOGIN LINK */}
        <p className="text-xs text-center text-text-muted pt-1">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-primary-hover hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
