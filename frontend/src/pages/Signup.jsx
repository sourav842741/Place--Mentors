import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "../services/api";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    skills: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const skillsArray = form.skills
        .split(",")
        .map((s) => s.trim());

      // ✅ ONLY SEND OTP DATA (NO FILE HERE)
      const res = await api.post("/api/auth/signup/send-otp", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        skills: skillsArray,
      });

      if (res.data.success) {
        alert("OTP sent 📩");

        // ✅ IMPORTANT: pass all data to verify page
        navigate("/verify-otp", {
          state: {
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            skills: skillsArray,
            avatar,
            coverImage,
          },
        });
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Signup failed ❌");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto text-white space-y-5">

        <h2 className="text-2xl font-semibold">Create Account</h2>

        <Input name="fullName" placeholder="Full Name" onChange={handleChange} className="bg-gray-800 border border-gray-600 text-white" />
        <Input name="email" placeholder="Email" onChange={handleChange} className="bg-gray-800 border border-gray-600 text-white" />
        <Input type="password" name="password" placeholder="Password" onChange={handleChange} className="bg-gray-800 border border-gray-600 text-white" />
        <Input name="skills" placeholder="Skills (comma separated)" onChange={handleChange} className="bg-gray-800 border border-gray-600 text-white" />

        {/* Avatar */}
        <div>
          <label className="text-sm text-gray-400">Avatar</label>
          <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />
        </div>

        {/* Cover */}
        <div>
          <label className="text-sm text-gray-400">Cover Image</label>
          <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} />
        </div>

        <Button onClick={handleSubmit} className="w-full bg-orange-500 hover:bg-orange-600">
          Sign Up
        </Button>
      </div>
    </AuthLayout>
  );
}