import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAuth from "../hooks/useAuth";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(Array(4).fill("")); // ✅ 4 digit OTP
  const [newPassword, setNewPassword] = useState("");

  const inputsRef = useRef([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      alert("Session expired, please try again");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Handle OTP input
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (
      value &&
      index < otp.length - 1 &&
      inputsRef.current[index + 1]
    ) {
      inputsRef.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputsRef.current[index - 1]
    ) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Handle reset
  const handleReset = async () => {
    const finalOtp = otp.join("");

    if (!email || !finalOtp || !newPassword) {
      alert("All fields are required ❗");
      return;
    }

    try {
      const res = await resetPassword({
        email,
        otp: finalOtp,
        newPassword,
      });

      console.log(res);

      if (res.success) {
        alert("Password Reset Successful ✅");
        navigate("/login");
      } else {
        alert(res.message || "Invalid OTP or expired");
      }
    } catch (err) {
      console.error(err);
      alert("Server error ❌");
    }
  };

  return (
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
          <h2 className="text-2xl font-semibold">Reset Password</h2>
          <div className="w-full h-px bg-gray-700 mt-2"></div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Email</label>
          <Input
            value={email}
            disabled
            className="bg-gray-800 border border-gray-600 text-gray-400"
          />
        </div>

        {/* OTP */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Enter OTP</label>

          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) =>
                  handleChange(e.target.value, index)
                }
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-lg rounded-md bg-gray-800 border border-gray-600 focus:border-orange-500 focus:outline-none"
              />
            ))}
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            New Password
          </label>
          <Input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            className="bg-gray-800 border border-gray-600 focus:border-orange-500 text-white"
          />
        </div>

        {/* Button */}
        <Button
          onClick={handleReset}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        >
          Reset Password
        </Button>
      </div>
    </AuthLayout>
  );
}