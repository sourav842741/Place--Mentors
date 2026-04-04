import React, { useEffect } from 'react';
import {
  X, LayoutDashboard, Building2, BookOpen,
  Briefcase, Sparkles, Calendar, Trophy,
  FileText, Flame, ChevronRight
} from "lucide-react";

import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";

export default function MobileSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useSelector((state) => state.user.user);

  //  BODY SCROLL LOCK
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Building2, label: "Companies", path: "/companies" },
    { icon: BookOpen, label: "Practice", path: "/quiz" },
    { icon: Briefcase, label: "Jobs", path: "/jobs" },
    { icon: Sparkles, label: "AI Planner", path: "/ai-planner" },
    { icon: Calendar, label: "Planner History", path: "/planner-history" },
    { icon: FileText, label: "AI Analyzer", path: "/resume-analyzer" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
  ];

  const handleNav = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-dvh w-64 bg-white border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        md:hidden overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <span className="text-xl font-bold">Place-Mentor</span>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-200">

          <div className="bg-orange-50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500" />
              <span>{currentUser?.streakCount || 0} Days</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={
                currentUser?.avatar && currentUser.avatar !== "null"
                  ? currentUser.avatar
                  : `https://ui-avatars.com/api/?name=${currentUser?.fullName}`
              }
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="text-sm font-medium">
                {currentUser?.fullName}
              </div>
              <div className="text-xs text-gray-500">
                Level {currentUser?.level}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}