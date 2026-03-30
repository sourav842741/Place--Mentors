// pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    const res = await login(form);

    if (res.success) {
      navigate("/dashboard");
    } else {
      alert(res.message);
    }
  };

 const handleGoogleLogin = async () => {
  const res = await googleLogin();

  if (res.success) {
    navigate("/dashboard");
  } else {
    alert(res.message);
  }
};

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-black text-white">

      {/* LEFT */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-5">

          <h2 className="text-3xl font-bold">Sign in</h2>

          <p className="text-sm text-gray-400">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-400">
              Sign up here
            </Link>
          </p>

          {/* EMAIL */}
          <div>
            <label className="text-sm">Email address</label>
            <Input
              placeholder="Enter email address"
              className="mt-1 bg-zinc-900 border-zinc-700"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex justify-between">
              <label className="text-sm">Password</label>
              <Link to="/forgot-password" className="text-blue-400 text-sm">
                Forgot password?
              </Link>
            </div>

            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="bg-zinc-900 border-zinc-700 pr-10"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />

              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <Button
            onClick={handleLogin}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            Sign in
          </Button>

          {/* DIVIDER */}
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex-1 h-[1px] bg-zinc-700"></div>
            Or continue with
            <div className="flex-1 h-[1px] bg-zinc-700"></div>
          </div>

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-2 rounded-lg font-medium"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>

        </div>
      </div>

      {/* RIGHT */}
      <div className="hidden md:flex flex-col justify-center px-12 bg-zinc-900 space-y-8">

        <h1 className="text-4xl font-bold">
          Welcome to Preparation Buddy 🚀
        </h1>

        <div className="space-y-6">

          <Feature
            title="All in One Coding Profile"
            desc="Track all your coding stats and progress in one place."
          />

          <Feature
            title="Follow Popular Sheets"
            desc="Organize questions and follow coding sheets easily."
          />

          <Feature
            title="Contest Tracker"
            desc="Track coding contests and improve performance."
          />

        </div>
      </div>
    </div>
  );
}

// 🔥 reusable component
function Feature({ title, desc }) {
  return (
    <div className="flex items-start gap-4">
      <div className="bg-black p-3 rounded-lg">
        <div className="w-6 h-6 bg-orange-500 rounded"></div>
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}
