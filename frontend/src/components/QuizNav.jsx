import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { BsRobot, BsCoin } from 'react-icons/bs';
import { HiOutlineLogout } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { setUserData } from '../redux/userSlice';
import { IoArrowBack } from 'react-icons/io5';

// ✅ NEW IMPORTS
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

function QuizNav() {
  const { user } = useSelector((state) => state.user);

  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);

  // ✅ DARK MODE STATE
  const [isDark, setIsDark] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ LOAD DARK MODE FROM LOCALSTORAGE
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  // TOGGLE DARK MODE
  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  //  LOGOUT
  const handleLogout = async () => {
    try {
      await api.get('/api/auth/logout');
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-950 flex justify-center px-4 pt-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-[24px] shadow-sm border border-gray-200 dark:border-white/10 px-8 py-4 flex justify-between items-center relative transition-colors duration-300"
      >
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* BACK */}
          <div
            onClick={() => navigate('/dashboard')}
            className="cursor-pointer p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
          >
            <IoArrowBack size={20} className="text-gray-700 dark:text-gray-300" />
          </div>

          {/* LOGO */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-lg transition">
              <BsRobot size={18} />
            </div>

            <h1 className="font-semibold hidden md:block text-lg text-gray-900 dark:text-white">
              Place-Mentor
            </h1>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-6 relative">
          {/*  DARK MODE */}
          <Button variant="ghost" size="icon" onClick={toggleDark}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>

          {/*  CREDITS */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <BsCoin size={20} />
              {user?.credits || 0}
            </button>

            {showCreditPopup && (
              <div className="absolute -right-12 mt-3 w-64 bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-white/10 rounded-xl p-5 z-50">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Need more credits to continue interviews?
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg text-sm"
                >
                  Buy more credits
                </button>
              </div>
            )}
          </div>

          {/* 👤 USER */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <div className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.slice(0, 1).toUpperCase()
                )}
              </div>

              <p className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.fullName || 'Guest'}
              </p>
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-white/10 rounded-xl p-4 z-50">
                <button
                  onClick={() => navigate('/history')}
                  className="w-full text-left text-sm py-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500"
                >
                  <HiOutlineLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default QuizNav;
