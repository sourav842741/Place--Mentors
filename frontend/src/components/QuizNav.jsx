import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from "framer-motion";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import api from "../services/api";
import { setUserData } from '../redux/userSlice';
import { IoArrowBack } from "react-icons/io5";

function QuizNav() {
const { user } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    <div className='bg-[#f3f3f3] flex justify-center px-4 pt-6'>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative'>

        {/* LOGO */}
       <div className='flex items-center gap-3'>

      {/* BACK BUTTON */}
      <div 
        onClick={() => navigate("/dashboard")}
        className='cursor-pointer p-2 hover:bg-gray-200 rounded-full transition'
      >
        <IoArrowBack size={20} />
      </div>

      {/* LOGO */}
      <div 
        className='flex items-center gap-3 cursor-pointer'
        onClick={() => navigate("/dashboard")}
      >
        <div className='bg-black text-white p-2 rounded-lg'>
          <BsRobot size={18} />
        </div>

        <h1 className='font-semibold hidden md:block text-lg'>
          Place-Mentor
        </h1>
      </div>

    </div>

        {/* RIGHT */}
        <div className='flex items-center gap-6 relative'>

          {/* CREDITS */}
          <div className='relative'>
            <button
              onClick={() => {
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className='flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full hover:bg-gray-200'>
              <BsCoin size={20} />
              {user?.credits || 0}
            </button>

            {showCreditPopup && (
              <div className='absolute -right-12.5 mt-3 w-64 bg-white shadow-xl border border-gray-200 rounded-xl p-5 z-50'>
                <p className='text-sm text-gray-600 mb-4'>
                  Need more credits to continue interviews?
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  className='w-full bg-black text-white py-2 rounded-lg text-sm'>
                  Buy more credits
                </button>
              </div>
            )}
          </div>

          {/* USER */}
          <div className='relative'>
  <button
    onClick={() => {
      setShowUserPopup(!showUserPopup);
      setShowCreditPopup(false);
    }}
    className="flex items-center gap-3 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
  >
    {/* Avatar */}
    <div className='w-9 h-9 rounded-full bg-black text-white flex items-center justify-center overflow-hidden'>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        user?.fullName?.slice(0, 1).toUpperCase()
      )}
    </div>

    {/* Name */}
    <p className='hidden sm:block text-sm font-medium text-gray-700'>
      {user?.fullName || "Guest"}
    </p>
  </button>

  {/* DROPDOWN */}
  {showUserPopup && (
    <div className='absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50'>
      <button
        onClick={() => navigate("/history")}
        className='w-full text-left text-sm py-2 hover:text-black text-gray-600'>
        Interview History
      </button>

      <button
        onClick={handleLogout}
        className='w-full text-left text-sm py-2 flex items-center gap-2 text-red-500'>
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