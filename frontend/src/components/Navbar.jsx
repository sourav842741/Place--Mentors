import React, { useState, useEffect } from "react";
import {
  Menu,
  Moon,
  Sun,
  X,
  LayoutDashboard,
  Building2,
  BookOpen,
  Briefcase,
  Sparkles,
  Calendar,
  Trophy,
  FileText,
  Flame,
} from "lucide-react";

import { BsCoin } from "react-icons/bs";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/userSlice";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {

  const { user, isAuth } = useSelector((state) => state.user);
  const companyCredits = useSelector((state) => state.company?.credits || 0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCreditPopup, setShowCreditPopup] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
{ icon: Building2, label: "All Companies", path: "/companies" },

    { icon: BookOpen, label: "Practice", path: "/quiz" },
    { icon: Briefcase, label: "Jobs", path: "/jobs" },
    { icon: Sparkles, label: "AI Planner", path: "/ai-planner" },
    { icon: Calendar, label: "Planner History", path: "/planner-history" },
    { icon: FileText, label: "AI Analyzer", path: "/resume-analyzer" },
    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
  ];

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md flex items-center justify-between z-50">
        {/* LEFT */}
        <div className="w-full flex items-center justify-between px-4 md:px-6">
          {" "}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </button>
          <div className="flex items-center gap-6">
           
            <div
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 cursor-pointer group"
            >
             
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg 
  transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
              >
                PM
              </div>

              {/* 🔥 TEXT */}
              <span className="font-bold text-base sm:text-lg tracking-wide">
                Place
                <span className="text-blue-600 group-hover:text-blue-500 transition">
                  Mentor
                </span>
              </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex gap-6 lg:ml-21">
              <Link to="/">Home</Link>
              <Link to="/jobs">Jobs</Link>
              <Link to="/about">About</Link>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* DARK MODE */}
          <Button variant="ghost" size="icon" onClick={toggleDark}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {/* CREDIT */}
          {isAuth && (
            <div className="relative">
              <button
                onClick={() => setShowCreditPopup(!showCreditPopup)}
                className="flex items-center gap-1 sm:gap-2 md:gap-3 
    bg-gray-100 
    px-2 sm:px-3 md:px-4 
    py-1 sm:py-1.5 md:py-2 
    rounded-full 
    hover:bg-gray-200 
    transition-all duration-200 
    shadow-sm hover:shadow-md"
              >
                <BsCoin className="text-yellow-500" size={16} />


                <span className="text-xs sm:text-sm md:text-base font-semibold">
                  {companyCredits > 0 ? companyCredits : (user?.credits || 0)}
                </span>

              </button>

              {showCreditPopup && (
                <div
                  className="absolute right-0 mt-3 
    w-48 sm:w-56 md:w-64 
    bg-white shadow-xl border rounded-xl 
    p-3 sm:p-4 md:p-5 
    z-50 animate-in fade-in zoom-in-95"
                >
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3">
                    Need more credits?
                  </p>

                  <button
                    onClick={() => navigate("/pricing")}
                    className="w-full 
        bg-black text-white 
        py-2 md:py-2.5 
        rounded-lg 
        text-xs sm:text-sm md:text-base 
        hover:bg-gray-800 transition"
                  >
                    Buy Credits
                  </button>
                </div>
              )}
            </div>
          )}

          {/* USER */}
          {isAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem>{user?.fullName}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>

                {user?.role === "admin" && (
                  <DropdownMenuItem
                    onClick={() => navigate("/admin/dashboard")}
                  >
                    Admin Panel
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-orange-500">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex fixed top-0 left-0 w-64 h-screen bg-white border-r p-4 flex-col z-40">
        <div className="text-xl font-bold mb-6">Place-Mentor</div>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                isActive ? "bg-blue-100 text-blue-600" : "text-gray-600"
              }`}
            >
              <item.icon />
              {item.label}
            </button>
          );
        })}

        {/* Bottom */}
        <div className="mt-auto">
          <div className="bg-orange-100 p-3 rounded mb-4 flex gap-2 items-center">
            <Flame className="text-orange-500" />
            {user?.streakCount || 0} Days
          </div>

          <div className="flex gap-3 items-center">
            {user?.avatar && user.avatar !== "null" ? (
              <img
                src={user.avatar}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {getInitials(user?.fullName)}
              </div>
            )}

            <div>
              <div>{user?.fullName}</div>
              <div className="text-sm text-gray-500">Level {user?.level}</div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />

          <div className="fixed top-0 left-0 w-64 h-full bg-white z-50 p-4">
            <div className="flex justify-between mb-4">
              <span className="font-bold">Menu</span>
              <button onClick={() => setMobileOpen(false)}>
                <X />
              </button>
            </div>

            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
                className="flex gap-3 p-3 w-full text-left"
              >
                <item.icon />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
