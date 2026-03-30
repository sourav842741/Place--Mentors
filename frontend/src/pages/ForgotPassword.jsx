import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "../components/AuthLayout";
import useAuth from "../hooks/useAuth";

export default function ForgotPassword() {
  const { sendResetOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const handleSendOtp = async () => {
    const res = await sendResetOtp({ email });

    if (res.success) {
      alert("OTP sent 📩");
      navigate("/reset-password", { state: { email } });
    } else {
      alert(res.message);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto text-white space-y-6">

        {/* Back Button */}
        <p
          onClick={() => navigate("/login")}
          className="text-sm text-blue-400 cursor-pointer"
        >
          ← Back to login
        </p>

        {/* Heading */}
        <div>
          <h2 className="text-2xl font-semibold">Verify Email</h2>
          <div className="w-full h-px bg-gray-700 mt-2"></div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Email address
          </label>
          <Input
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border border-gray-600 focus:border-orange-500 text-white"
          />
        </div>

        {/* Button */}
        <Button
          onClick={handleSendOtp}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        >
          Send OTP
        </Button>
      </div>
    </AuthLayout>
  );
}