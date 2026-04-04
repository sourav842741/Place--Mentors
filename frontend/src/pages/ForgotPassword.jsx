import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthLayout from "../components/AuthLayout";
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
      toast.error("Something went wrong ");
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
            <h2 className="text-3xl font-bold">Forgot Password</h2>
            <p className="text-gray-400 text-sm mt-1">
              Enter your email to receive OTP
            </p>
          </div>

          {/* Email */}
          <Input
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-900 border-zinc-700 focus:border-orange-500"
          />

          {/* Button */}
          <Button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner />
                Sending...
              </>
            ) : (
              "Send OTP"
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
        <p className="text-white text-sm">Sending OTP...</p>
      </div>
    </div>
  );
}