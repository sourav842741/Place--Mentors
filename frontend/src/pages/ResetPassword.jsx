import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(Array(4).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputsRef = useRef([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      toast.error("Session expired ");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // OTP change
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Paste OTP
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.split("");
    setOtp(newOtp);

    newOtp.forEach((val, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = val;
      }
    });
  };

  // Reset password
  const handleReset = async () => {
    const finalOtp = otp.join("");

    if (!email || finalOtp.length !== 4 || !newPassword) {
      return toast.warning("All fields are required ❗");
    }

    setLoading(true);

    try {
      const res = await resetPassword({
        email,
        otp: finalOtp,
        newPassword,
      });

      if (res.success) {
        toast.success("Password Reset Successful ");
        navigate("/login");
      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FULL SCREEN LOADER */}
      {loading && <FullScreenLoader />}

      <AuthLayout>
        <div className="w-full max-w-md mx-auto text-white space-y-6">

          {/* Back */}
          <p
            onClick={() => navigate("/login")}
            className="text-sm text-blue-400 cursor-pointer"
          >
            ← Back to login
          </p>

          {/* Heading */}
          <div>
            <h2 className="text-3xl font-bold">Reset Password</h2>
            <p className="text-gray-400 text-sm mt-1">
              Enter OTP and new password
            </p>
          </div>

          {/* Email */}
          <Input
            value={email}
            disabled
            className="bg-zinc-900 border-zinc-700 text-gray-400"
          />

          {/* OTP */}
          <div onPaste={handlePaste} className="flex gap-3 justify-between">
            {otp.map((digit, index) => (
              <input
                key={index}
                maxLength={1}
                value={digit}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-14 text-center text-lg rounded-xl bg-zinc-900 border border-zinc-700 focus:border-orange-500 focus:outline-none transition"
              />
            ))}
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-zinc-900 border-zinc-700 pr-10"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* Button */}
          <Button
            onClick={handleReset}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </AuthLayout>
    </>
  );
}

// Spinner
function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  );
}

// Loader
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-sm">Resetting password...</p>
      </div>
    </div>
  );
}