
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const { googleLogin, sendSignupOtp } = useAuth();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    skills: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ FILE SELECT (CLICK FIX)
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];

    if (type === "avatar") {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      return toast.warning("Please fill all required fields");
    }

    setLoading(true);

    try {
      const skillsArray = form.skills
        ? form.skills.split(",").map((s) => s.trim())
        : [];

      const res = await sendSignupOtp({
        ...form,
        skills: skillsArray,
      });

      if (res.success) {
        toast.success("OTP sent 📩");

        navigate("/verify-otp", {
          state: { ...form, skills: skillsArray, avatar, coverImage },
        });
      } else {
        toast.error(res.message || "Signup failed");
      }

    } catch {
      toast.error("Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto space-y-5">

        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Create Account
        </h2>

        {/* INPUTS */}
        <Input name="fullName" placeholder="Full Name" onChange={handleChange}
          className="bg-gray-100 border-gray-300" />

        <Input name="email" placeholder="Email" onChange={handleChange}
          className="bg-gray-100 border-gray-300" />

        <Input type="password" name="password" placeholder="Password" onChange={handleChange}
          className="bg-gray-100 border-gray-300" />

        <Input name="skills" placeholder="Skills (comma separated)" onChange={handleChange}
          className="bg-gray-100 border-gray-300" />

        {/* AVATAR */}
        <div className="text-center">
          <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-xl p-4">
            {avatarPreview ? (
              <img src={avatarPreview} className="w-20 h-20 mx-auto rounded-full object-cover" />
            ) : (
              <p className="text-gray-500 text-sm">Upload Avatar</p>
            )}
            <input type="file" hidden onChange={(e) => handleFileChange(e, "avatar")} />
          </label>
        </div>

        {/* COVER */}
        <div className="text-center">
          <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-xl p-4">
            {coverPreview ? (
              <img src={coverPreview} className="w-full h-24 object-cover rounded-md" />
            ) : (
              <p className="text-gray-500 text-sm">Upload Cover Image</p>
            )}
            <input type="file" hidden onChange={(e) => handleFileChange(e, "cover")} />
          </label>
        </div>

        {/* BUTTON */}
        <Button onClick={handleSubmit} disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white">
          {loading ? "Creating..." : "Sign Up"}
        </Button>

        {/* GOOGLE */}
        <button
          onClick={async () => {
            const res = await googleLogin();
            if (res.success) window.location.reload();
          }}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-black py-2 rounded-lg hover:bg-gray-100"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
          Sign up with Google
        </button>

        {/* LOGIN REDIRECT */}
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </AuthLayout>
  );
}

