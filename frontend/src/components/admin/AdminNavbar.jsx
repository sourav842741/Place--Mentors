import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/userSlice";
import api from "../../services/api";
import { useTheme } from "../../hooks/useTheme";

import { Button } from "@/components/ui/button";
import { Sun, Moon, LogOut, LayoutDashboard, Menu, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const { isDark, toggleTheme } = useTheme();

  const [showThemePopup, setShowThemePopup] = useState(false);
  const [popupContent, setPopupContent] = useState({
    icon: null,
    title: "",
    subtitle: "",
  });

  /* THEME TOGGLE + POPUP */
  const handleToggleTheme = () => {
    const willBeDark = !isDark;
    toggleTheme();

    setPopupContent({
      icon: willBeDark ? Moon : Sun,
      title: willBeDark ? "Dark Mode Enabled" : "Light Mode Enabled",
      subtitle: willBeDark ? "Night mode activated 🌙" : "Light mode activated ☀️",
    });

    setShowThemePopup(true);
    setTimeout(() => {
      setShowThemePopup(false);
    }, 2000);
  };

  const handleLogout = async () => {
    try {
      await api.get("/api/auth/signout", {
        withCredentials: true,
      });

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
    <div className="h-16 w-full">
      <div className="w-full h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* LEFT */}
          <div className="flex items-center gap-3">
            {/* MOBILE MENU */}
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Open Admin Menu"
              className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* LOGO */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
              <LayoutDashboard className="w-5 h-5" />
            </div>

            {/* TITLE */}
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-text leading-tight flex items-center gap-2">
                Admin Panel
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-soft text-primary border border-primary/20">
                  <ShieldCheck className="w-3 h-3" /> Staff
                </span>
              </h1>

              <p className="text-xs text-text-subtle">
                {user?.fullName || "Administrator"}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* THEME BUTTON */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleTheme}
                className="group relative p-2 rounded-2xl hover:scale-105 transition-all duration-300 text-text hover:bg-surface-2"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-amber-400 relative z-10 transition-transform group-hover:rotate-45" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-600 relative z-10 transition-transform group-hover:-rotate-12" />
                )}
              </Button>

              {/* POPUP */}
              {showThemePopup && (
                <div className="absolute top-full right-0 mt-3 w-64 p-4 rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 z-50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl shadow-md ${
                        isDark
                          ? "bg-gradient-to-br from-slate-700 to-slate-900 text-white"
                          : "bg-gradient-to-br from-amber-400 to-orange-400 text-white"
                      }`}
                    >
                      {popupContent.icon ? (
                        <popupContent.icon className="h-5 w-5 text-white" />
                      ) : null}
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-text">
                        {popupContent.title}
                      </h3>

                      <p className="text-xs text-text-subtle">
                        {popupContent.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* USER MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-9 w-9 ring-2 ring-border">
                    <AvatarImage src={user?.avatar} />

                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 bg-surface border-border text-text shadow-xl">
                <div className="flex items-center justify-between p-2 border-b border-border">
                  <span className="text-sm font-semibold truncate text-text">{user?.fullName}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-primary-soft text-primary border border-primary/20">
                    Admin
                  </span>
                </div>

                <DropdownMenuItem
                  onClick={() => navigate("/dashboard")}
                  className="cursor-pointer mt-2 text-text hover:bg-surface-2 focus:bg-surface-2 focus:text-text transition-colors"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4 text-text-muted" />
                  User Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-500 transition-colors"
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
