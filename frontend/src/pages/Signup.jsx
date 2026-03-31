import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();

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

  // ================= DRAG HANDLER =================
  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (type === "avatar") {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // ================= SIGNUP =================
  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      return toast.warning("Please fill all required fields");
    }

    setLoading(true);

    try {
      const skillsArray = form.skills
        ? form.skills.split(",").map((s) => s.trim())
        : [];

      // API call
      await new Promise((res) => setTimeout(res, 1500)); // demo

      toast.success("OTP sent 📩");

      navigate("/verify-otp", {
        state: { ...form, skills: skillsArray, avatar, coverImage },
      });
    } catch (err) {
      toast.error("Signup failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto text-white space-y-5">

        <h2 className="text-3xl font-bold">Create Account</h2>

        {/* INPUTS */}
        <Input name="fullName" placeholder="Full Name" onChange={handleChange} className="bg-zinc-900 border-zinc-700" />
        <Input name="email" placeholder="Email" onChange={handleChange} className="bg-zinc-900 border-zinc-700" />
        <Input type="password" name="password" placeholder="Password" onChange={handleChange} className="bg-zinc-900 border-zinc-700" />
        <Input name="skills" placeholder="Skills (comma separated)" onChange={handleChange} className="bg-zinc-900 border-zinc-700" />

        {/* AVATAR DRAG */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "avatar")}
          className="border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center cursor-pointer"
        >
          {avatarPreview ? (
            <img src={avatarPreview} className="w-20 h-20 mx-auto rounded-full object-cover" />
          ) : (
            <p className="text-gray-400 text-sm">Drag & drop avatar here</p>
          )}
        </div>

        {/* COVER DRAG */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "cover")}
          className="border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center cursor-pointer"
        >
          {coverPreview ? (
            <img src={coverPreview} className="w-full h-24 object-cover rounded-md" />
          ) : (
            <p className="text-gray-400 text-sm">Drag & drop cover image</p>
          )}
        </div>

        {/* SIGNUP BUTTON */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-2"
        >
          {loading ? "Creating..." : "Sign Up"}
        </Button>

        {/* DIVIDER */}
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex-1 h-px bg-zinc-700"></div>
          Or continue with
          <div className="flex-1 h-px bg-zinc-700"></div>
        </div>

        {/* GOOGLE SIGNUP */}
        <button
          onClick={googleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-black py-2 rounded-lg font-medium"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Sign up with Google
        </button>

      </div>
    </AuthLayout>
  );
}