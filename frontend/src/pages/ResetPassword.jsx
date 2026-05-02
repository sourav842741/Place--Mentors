import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Sun, Moon, ArrowLeft, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
import useAuth from '../hooks/useAuth';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || '';

  const [otp, setOtp] = useState(Array(4).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const inputsRef = useRef([]);

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

  useEffect(() => {
    if (!email) {
      toast.error('Session expired');
      navigate('/forgot-password');
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
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').slice(0, 4);
    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.split('');
    setOtp(newOtp);

    newOtp.forEach((val, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = val;
      }
    });
  };

  const handleReset = async () => {
    const finalOtp = otp.join('');

    if (!email || finalOtp.length !== 4 || !newPassword) {
      return toast.warning('All fields are required ❗');
    }

    setLoading(true);

    try {
      const res = await resetPassword({
        email,
        otp: finalOtp,
        newPassword,
      });

      if (res.success) {
        toast.success('Password Reset Successful 🎉');
        navigate('/login');
      } else {
        toast.error(res.message || 'Invalid OTP');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <FullScreenLoader />}

      {/* THEME BUTTON */}
      <div className="absolute top-5 right-5 z-20">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          {isDark ? <Sun /> : <Moon />}
        </Button>
      </div>

      <div
        className="min-h-screen flex items-center justify-center px-4
        bg-gradient-to-br from-slate-50 via-white to-indigo-50
        dark:from-gray-950 dark:via-gray-900 dark:to-black"
      >
        {/* CARD */}
        <div
          className="w-full max-w-md rounded-3xl p-7 space-y-6
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
          border border-gray-200 dark:border-white/10 shadow-2xl"
        >
          {/* LOGO */}
          <div className="flex justify-center">
            <img
              src="https://res.cloudinary.com/dm9hpyepi/image/upload/v1776539367/android-chrome-512x512_stedh8.png"
              alt="PlaceMentor"
              className="w-20 h-20 rounded-2xl shadow-lg"
            />
          </div>

          {/* BACK */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </button>

          {/* HEADING */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Enter OTP and create your new password
            </p>
          </div>

          {/* EMAIL */}
          <Input
            value={email}
            disabled
            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500"
          />

          {/* OTP */}
          <div onPaste={handlePaste} className="flex justify-between gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                maxLength={1}
                value={digit}
                ref={(el) => (inputsRef.current[index] = el)}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-14 h-14 rounded-xl text-center text-xl font-semibold
                bg-gray-100 dark:bg-gray-800
                border border-gray-300 dark:border-gray-700
                text-gray-900 dark:text-white
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                outline-none transition"
              />
            ))}
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500 dark:text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* BUTTON */}
          <Button
            onClick={handleReset}
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
          >
            <LockKeyhole className="w-4 h-4 mr-2" />
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </div>
      </div>
    </>
  );
}

/* FULL LOADER */
function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 px-8 py-6 rounded-2xl shadow-2xl text-center">
        <div className="w-10 h-10 mx-auto border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />

        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">Resetting password...</p>
      </div>
    </div>
  );
}
