import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const { user } = useSelector((state) => state.user);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      return toast.warning("Please enter email and password");
    }

    setLoading(true);

    try {
      const res = await login(form);

      if (res.success) {
        toast.success("Welcome back 🎉");
        navigate("/dashboard");
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      const res = await googleLogin();

      if (res.success) {
        toast.success("Google login successful 🚀");
        navigate("/dashboard");
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
    <>
      {(loading || googleLoading) && <FullScreenLoader />}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-orange-50 to-blue-50 px-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-5 border">

          <h2 className="text-3xl font-bold text-center text-gray-900">
            Sign in
          </h2>

          <p className="text-sm text-gray-500 text-center">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-orange-500">
              Sign up here
            </Link>
          </p>

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-700">Email address</label>
            <Input
              placeholder="Enter email"
              className="mt-1 bg-gray-50 border-gray-300"
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          {/* PASSWORD */}
          <div>
            <div className="flex justify-between">
              <label className="text-sm text-gray-700">Password</label>
              <Link to="/forgot-password" className="text-orange-500 text-sm">
                Forgot password?
              </Link>
            </div>

            <div className="relative mt-1">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="bg-gray-50 border-gray-300 pr-10"
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />

              <span
                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          {/* DIVIDER */}
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex-1 h-px bg-gray-300"></div>
            Or continue with
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border py-2 rounded-lg font-medium hover:bg-gray-50"
          >
            {googleLoading ? (
              <Spinner dark />
            ) : (
              <>
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                />
                Sign in with Google
              </>
            )}
          </button>

        </div>
      </div>
    </>
  );
}

function Spinner({ dark }) {
  return (
    <div
      className={`w-4 h-4 border-2 ${
        dark ? "border-black" : "border-gray-700"
      } border-t-transparent rounded-full animate-spin`}
    ></div>
  );
}

function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 text-sm">Please wait...</p>
      </div>
    </div>
  );
}