import {
  LayoutDashboard, Building2, BookOpen,
  Briefcase, Sparkles, Calendar, Trophy, FileText, Flame,
  ChevronRight,FilePlus2
} from "lucide-react";

import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';

import MobileSidebar from './MobileSidebar';

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => {
      setIsMobileOpen(prev => !prev);
    };

    document.addEventListener('toggleMobileSidebar', handleToggle);
    return () => document.removeEventListener('toggleMobileSidebar', handleToggle);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.user.user);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Building2, label: "Companies", path: "/companies" },
    { icon: BookOpen, label: "Practice", path: "/quiz" },
    { icon: Briefcase, label: "Jobs", path: "/jobs" },
    { icon: Sparkles, label: "AI Planner", path: "/ai-planner" },
    { icon: Calendar, label: "Planner History", path: "/planner-history" },
    { icon: FileText, label: "AI Analyzer", path: "/resume-analyzer" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
      { icon: FilePlus2, label: "Resume Generator", path: "/resume-generator" },

  ];

  const handleNav = (path) => navigate(path);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col h-[100dvh] sticky top-0 overflow-y-auto z-40">

        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => handleNav("/dashboard")}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white rounded rotate-45"></div>
            </div>
            <span className="text-xl font-bold text-gray-900">Place-Mentor</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 space-y-4">

          {/* Streak Card */}
          <div className="bg-linear-to-br from-orange-50 to-red-50 rounded-lg p-4">
            <div className="text-xs text-gray-600 font-semibold mb-2">CURRENT STREAK</div>

            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-6 h-6 text-orange-500" fill="currentColor" />
              <span className="text-2xl font-bold text-gray-900">
                {currentUser?.streakCount || 0} Days
              </span>
            </div>

            <button
              onClick={() => handleNav("/leaderboard")}
              className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all w-full text-left"
            >
              View Leaderboard
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <img
              src={
                currentUser?.avatar && currentUser.avatar !== "null"
                  ? currentUser.avatar
                  : `https://ui-avatars.com/api/?name=${currentUser?.fullName}&background=2563eb&color=fff`
              }
              className="w-10 h-10 rounded-full object-cover"
              alt="User avatar"
            />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-900 truncate block">
                {currentUser?.fullName || "User"}
              </span>
              <span className="text-xs text-gray-500">
                Level {currentUser?.level || 1}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </>
  );
}