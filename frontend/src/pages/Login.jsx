import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
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

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

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

  // ✅ LOGIN
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

        // 🔥 ROLE BASED REDIRECT
        if (user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(res?.message || "Login failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ✅ GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      const res = await googleLogin();

      if (res.success) {
        toast.success("Google login successful 🚀");
        window.location.reload();
      } else {
        toast.error(res.message || "Google login failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* 🌙 THEME TOGGLE */}
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

      {/* CARD */}
      <div className="w-full max-w-md space-y-5 
        bg-white dark:bg-gray-900 
        p-6 rounded-2xl shadow-md border 
        border-gray-200 dark:border-gray-700
      ">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Sign in
        </h2>

        {/* EMAIL */}
        <Input
          placeholder="Email"
          className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        {/* PASSWORD */}
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-black dark:text-white pr-10"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500 dark:text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {/* FORGOT */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-orange-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* LOGIN BTN */}
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 
          bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-700 
          text-black dark:text-white 
          py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Sign in with Google
        </button>

        {/* SIGNUP */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Don’t have an account?{" "}
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