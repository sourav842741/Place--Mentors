import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/userSlice";
import api from "../../services/api";

import { Button } from "@/components/ui/button";
import {
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  Menu,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminNavbar({ setIsOpen }) {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(false);

  // ✅ LOAD THEME (FIXED)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  // ✅ TOGGLE THEME
  const toggleTheme = () => {
    const isNowDark = document.documentElement.classList.toggle("dark");
    setIsDark(isNowDark);
    localStorage.setItem("theme", isNowDark ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      await api.get("/api/auth/signout", { withCredentials: true });
      dispatch(logoutUser());
      navigate("/");
    } catch {
      dispatch(logoutUser());
      navigate("/");
    }
  };

  const getInitials = (name) => {
    if (!name) return "AU";
    const words = name.trim().split(" ");
    return words.length === 1
      ? words[0][0].toUpperCase()
      : (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div className="h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-40">
      
      <div className="w-full px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">

          {/* LEFT */}
          <div className="flex items-center gap-3">

            {/* ✅ Hamburger */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.fullName || "Admin"}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* 🌙 Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* 👤 User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold">
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm font-medium">
                    {user?.fullName}
                  </span>
                  <span className="text-xs text-gray-400">Admin</span>
                </div>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>
    </div>
  );
}