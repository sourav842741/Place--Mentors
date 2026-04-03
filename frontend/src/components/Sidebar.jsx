import {
  LayoutDashboard, Building2, BookOpen,
  Briefcase, Sparkles, Trophy, Flame,
  ChevronRight, User
} from "lucide-react";

import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Redux user data
  const currentUser = useSelector((state) => state.user.user);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Building2, label: "Companies", path: "/companies" },
    { icon: BookOpen, label: "Practice", path: "/quiz" },
    { icon: Briefcase, label: "Jobs", path: "/jobs" },
    { icon: Sparkles, label: "AI Planner", path: "/ai-planner" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
  ];

  return (
<div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed top-0 left-0">
      {/* LOGO */}
      <div className="p-6 border-b border-gray-200">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white rounded rotate-45"></div>
        </div>
        <span className="text-xl font-bold text-gray-900">
          Place-Mentor
        </span>
      </div>
    </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* BOTTOM SECTION */}
      <div className="p-4 border-t border-gray-200">

        {/* 🔥 STREAK CARD */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 mb-4">
          <div className="text-xs text-gray-600 font-semibold mb-2">
            CURRENT STREAK
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Flame
              className="w-6 h-6 text-orange-500"
              fill="currentColor"
            />
            <span className="text-2xl font-bold text-gray-900">
              {currentUser?.streakCount || 0} Days
            </span>
          </div>

          {/* 👉 Leaderboard Redirect */}
          <button
            onClick={() => navigate("/leaderboard")}
            className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
          >
            View Leaderboard
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 👤 USER PROFILE */}
        <div className="flex items-center gap-3 px-2 py-2">

          {/* ✅ Avatar FIX */}
          <img
            src={
              currentUser?.avatar && currentUser.avatar !== "null"
                ? currentUser.avatar
                : `https://ui-avatars.com/api/?name=${currentUser?.fullName}&background=2563eb&color=fff`
            }
            className="w-8 h-8 rounded-full object-cover"
          />

          <span className="text-sm font-medium text-gray-700">
            {currentUser?.fullName || "User"}
          </span>
        </div>
      </div>
    </div>
  );
}