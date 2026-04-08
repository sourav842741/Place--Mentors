import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "../services/api";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const { email, fullName, password, skills, avatar, coverImage } =
    state || {};

  const [otp, setOtp] = useState(Array(4).fill(""));
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error("Session expired");
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

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

  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4) {
      return toast.warning("Enter valid OTP");
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("email", email);
      formData.append("otp", finalOtp);
      formData.append("fullName", fullName);
      formData.append("password", password);
      formData.append("skills", JSON.stringify(skills));

      if (avatar) formData.append("avatar", avatar);
      if (coverImage) formData.append("coverImage", coverImage);

      const res = await api.post(
        "/api/auth/signup/verify-otp",
        formData
      );

      if (res.data.success) {
        toast.success("Signup Successful 🎉");
        navigate("/dashboard");
      } else {
        toast.error(res.data.message || "Invalid OTP");
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

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-orange-50 to-blue-50 px-4">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6 border text-center">

          <h2 className="text-3xl font-bold text-gray-900">
            Verify Email
          </h2>

          <p className="text-sm text-gray-500">
            Enter the 4-digit OTP sent to your email
          </p>

          {/* OTP INPUTS */}
          <div
            className="flex justify-between gap-3"
            onPaste={handlePaste}
          >
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
                className="w-14 h-14 text-center text-lg rounded-xl bg-gray-50 border border-gray-300 focus:border-orange-500 focus:outline-none transition"
              />
            ))}
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleVerifyOtp}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? "Verifying..." : "Verify OTP"}
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
        <p className="text-gray-700 text-sm">Verifying OTP...</p>
      </div>
    </div>
  );
}