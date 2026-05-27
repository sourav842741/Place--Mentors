import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setUserData } from "../redux/userSlice";
import { IoArrowBack } from "react-icons/io5";

// ✅ NEW IMPORTS
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

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
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  // TOGGLE DARK MODE
  const toggleDark = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  //  LOGOUT
  const handleLogout = async () => {
    try {
      await api.get("/api/auth/logout");
      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full px-4 md:px-8 h-[72px] flex items-center justify-between"
      >
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* BACK */}
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <IoArrowBack size={20} className="text-gray-700 dark:text-gray-300" />
          </button>

          {/* LOGO */}
          <div
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            {/* ICON */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              {/* Glow */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 blur-md opacity-70 animate-pulse"></div>

              {/* Icon */}
              <div
                className="relative bg-gray-900 text-white font-bold rounded-lg w-full h-full flex items-center justify-center 
    transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
              >
                PM
              </div>
            </div>
            {/* TEXT */}
            <span className="font-bold text-lg tracking-wide text-gray-900 dark:text-white">
              Place
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                Mentor
              </span>
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 md:gap-5 relative">
          {/* DARK MODE */}
          <Button variant="ghost" size="icon" onClick={toggleDark} className="rounded-xl">
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </Button>

          {/* CREDITS */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-4 h-11 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <BsCoin size={18} />
              <span className="font-medium">{user?.credits || 0}</span>
            </button>

            {showCreditPopup && (
              <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-5 z-50">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Need more credits to continue interviews?
                </p>

                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition"
                >
                  Buy more credits
                </button>
              </div>
            )}
          </div>

          {/* USER */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden font-semibold">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.slice(0, 1).toUpperCase()
                )}
              </div>

              <p className="hidden md:block text-sm font-semibold text-gray-700 dark:text-gray-300">
                {user?.fullName || "Guest"}
              </p>
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-white/10 rounded-2xl p-3 z-50">
                <button
                  onClick={() => navigate("/history")}
                  className="w-full text-left text-sm px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                >
                  Interview History
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm px-3 py-2.5 rounded-xl flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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
