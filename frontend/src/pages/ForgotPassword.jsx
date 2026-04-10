import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useAuth from "../hooks/useAuth";
import { toast } from "sonner";

export default function ForgotPassword() {
  const { sendResetOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      return toast.warning("Please enter your email");
    }

    setLoading(true);

    try {
      const res = await sendResetOtp({ email });

      if (res.success) {
        toast.success("OTP sent to your email 📩");
        navigate("/reset-password", { state: { email } });
      } else {
        toast.error(res.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <FullScreenLoader />}

      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white via-orange-50 to-blue-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6 border">
          {/* BACK */}
          <p
            onClick={() => navigate("/login")}
            className="text-sm text-orange-500 cursor-pointer"
          >
            ← Back to login
          </p>

          {/* HEADING */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Forgot Password
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Enter your email to receive OTP
            </p>
          </div>

          {/* EMAIL */}
          <Input
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-50 border-gray-300 focus:border-orange-500"
          />

          {/* BUTTON */}
          <Button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        </div>
      </div>
    </>
  );
}

function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-700 text-sm">Sending OTP...</p>
      </div>
    </div>
  );
}
