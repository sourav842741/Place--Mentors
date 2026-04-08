import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useAuth from "../hooks/useAuth";

export default function Signup() {
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const { user } = useSelector((state) => state.user);

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

  // 🔥 REDIRECT IF LOGGED IN
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      return toast.warning("Please fill all required fields");
    }

    setLoading(true);

    try {
      const skillsArray = form.skills
        ? form.skills.split(",").map((s) => s.trim())
        : [];

      await new Promise((res) => setTimeout(res, 1500));

      toast.success("OTP sent 📩");

      navigate("/verify-otp", {
        state: { ...form, skills: skillsArray, avatar, coverImage },
      });
    } catch {
      toast.error("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-orange-50 to-blue-50 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-5 border">

        <h2 className="text-3xl font-bold text-center text-gray-900">
          Create Account
        </h2>

        {/* INPUTS */}
        <Input
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          className="bg-gray-50 border-gray-300"
        />

        <Input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="bg-gray-50 border-gray-300"
        />

        <Input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="bg-gray-50 border-gray-300"
        />

        <Input
          name="skills"
          placeholder="Skills (comma separated)"
          onChange={handleChange}
          className="bg-gray-50 border-gray-300"
        />

        {/* AVATAR */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "avatar")}
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer bg-gray-50"
        >
          {avatarPreview ? (
            <img
              src={avatarPreview}
              className="w-20 h-20 mx-auto rounded-full object-cover"
            />
          ) : (
            <p className="text-gray-500 text-sm">
              Drag & drop avatar here
            </p>
          )}
        </div>

        {/* COVER */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, "cover")}
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer bg-gray-50"
        >
          {coverPreview ? (
            <img
              src={coverPreview}
              className="w-full h-24 object-cover rounded-md"
            />
          ) : (
            <p className="text-gray-500 text-sm">
              Drag & drop cover image
            </p>
          )}
        </div>

        {/* BUTTON */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
        >
          {loading ? "Creating..." : "Sign Up"}
        </Button>

        {/* DIVIDER */}
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex-1 h-px bg-gray-300"></div>
          Or continue with
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* GOOGLE */}
        <button
          onClick={googleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border py-2 rounded-lg font-medium hover:bg-gray-50"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
          />
          Sign up with Google
        </button>

      </div>
    </div>
  );
}