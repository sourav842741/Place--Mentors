import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

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

        // 🔥 IMPORTANT
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
      <div className="w-full max-w-md space-y-5">

        <h2 className="text-3xl font-bold">Sign in</h2>

        <Input placeholder="Email" onChange={(e) =>
          setForm({ ...form, email: e.target.value })}
          className="bg-zinc-900 border-zinc-700"
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="bg-zinc-900 border-zinc-700 pr-10"
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })}
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        <Button onClick={handleLogin} disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600">
          {loading ? "Signing in..." : "Sign in"}
        </Button>

        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-2 rounded-lg"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
          Sign in with Google
        </button>

      </div>
    </AuthLayout>
  );
}