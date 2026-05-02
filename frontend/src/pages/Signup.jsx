import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Moon, Sun, Upload, ImageIcon, User } from 'lucide-react';

import AuthLayout from '../components/AuthLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import useAuth from '../hooks/useAuth';

export default function Signup() {
  const navigate = useNavigate();
  const { googleLogin, sendSignupOtp } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    skills: '',
  });

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  /* THEME LOAD */
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  /* THEME TOGGLE */
  const toggleTheme = () => {
    const isNowDark = document.documentElement.classList.toggle('dark');
    setIsDark(isNowDark);
    localStorage.setItem('theme', isNowDark ? 'dark' : 'light');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];

    if (type === 'avatar') {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      return toast.warning('Please fill all required fields');
    }

    setLoading(true);

    try {
      const skillsArray = form.skills ? form.skills.split(',').map((s) => s.trim()) : [];

      const res = await sendSignupOtp({
        ...form,
        skills: skillsArray,
      });

      if (res.success) {
        toast.success('OTP sent 📩');

        navigate('/verify-otp', {
          state: { ...form, skills: skillsArray, avatar, coverImage },
        });
      } else {
        toast.error(res.message || 'Signup failed');
      }
    } catch {
      toast.error('Signup failed ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* THEME BUTTON */}
      <div className="absolute top-5 right-5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>

      {/* CARD */}
      <div
        className="w-full max-w-md mx-auto space-y-5
        bg-white dark:bg-gray-900
        p-6 rounded-2xl shadow-xl border
        border-gray-200 dark:border-white/10"
      >
        {/* LOGO */}
        <div className="flex justify-center">
          <img
            src="https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png"
            alt="PlaceMentor"
            className="w-18 h-18 rounded-2xl shadow-lg"
          />
        </div>

        {/* TITLE */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h2>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Start your placement journey today 🚀
          </p>
        </div>

        {/* INPUTS */}
        <Input
          name="fullName"
          placeholder="Full Name"
          onChange={handleChange}
          className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        />

        <Input
          name="email"
          placeholder="Email Address"
          onChange={handleChange}
          className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        />

        <Input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        />

        <Input
          name="skills"
          placeholder="Skills (React, Java, DSA...)"
          onChange={handleChange}
          className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
        />

        {/* AVATAR */}
        <label
          className="cursor-pointer block border-2 border-dashed border-blue-300 dark:border-blue-700
          rounded-xl p-4 text-center hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
        >
          {avatarPreview ? (
            <img src={avatarPreview} className="w-20 h-20 mx-auto rounded-full object-cover" />
          ) : (
            <div className="space-y-2">
              <User className="mx-auto w-6 h-6 text-blue-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload Avatar</p>
            </div>
          )}

          <input type="file" hidden onChange={(e) => handleFileChange(e, 'avatar')} />
        </label>

        {/* COVER */}
        <label
          className="cursor-pointer block border-2 border-dashed border-purple-300 dark:border-purple-700
          rounded-xl p-4 text-center hover:bg-purple-50 dark:hover:bg-purple-950/30 transition"
        >
          {coverPreview ? (
            <img src={coverPreview} className="w-full h-24 object-cover rounded-lg" />
          ) : (
            <div className="space-y-2">
              <ImageIcon className="mx-auto w-6 h-6 text-purple-500" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload Cover Image</p>
            </div>
          )}

          <input type="file" hidden onChange={(e) => handleFileChange(e, 'cover')} />
        </label>

        {/* SIGNUP BUTTON */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
        >
          {loading ? 'Creating...' : 'Sign Up'}
        </Button>

        {/* GOOGLE */}
        <button
          onClick={async () => {
            const res = await googleLogin();

            if (res.success) {
              toast.success('Login successful');

              navigate('/splash');
            } else if (res.requiresTwoFactor) {
              navigate('/verify-2fa', {
                state: {
                  tempAuthToken: res.tempAuthToken,
                  role: res.role,
                  isSuperAdmin: res.isSuperAdmin,
                },
              });
            } else {
              toast.error(res.message || 'Google login failed');
            }
          }}
          className="w-full flex items-center justify-center gap-3
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-700
          py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
          Sign up with Google
        </button>

        {/* LOGIN */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
