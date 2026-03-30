import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Button } from "@/components/ui/button";
import api from "../services/api";

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    email,
    fullName,
    password,
    skills,
    avatar,
    coverImage,
  } = state || {};

  const [otp, setOtp] = useState(Array(4).fill(""));
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      alert("Session expired");
      navigate("/signup");
    }
  }, [email, navigate]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (
      value &&
      index < otp.length - 1 &&
      inputsRef.current[index + 1]
    ) {
      inputsRef.current[index + 1].focus();
    }
  };

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

  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4) {
      alert("Enter valid OTP ❗");
      return;
    }

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
        alert("Signup Success 🎉");
        navigate("/dashboard");
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto text-white space-y-6">

        <h2 className="text-2xl font-semibold">Verify Email</h2>

        {/* OTP */}
        <div className="flex gap-2">
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
              className="w-12 h-12 text-center bg-gray-800 border border-gray-600"
            />
          ))}
        </div>

        <Button
          onClick={handleVerifyOtp}
          className="w-full bg-orange-500"
        >
          Verify
        </Button>
      </div>
    </AuthLayout>
  );
}