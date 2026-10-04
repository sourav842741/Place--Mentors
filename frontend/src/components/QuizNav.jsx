import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Coins, LogOut, ArrowLeft, Sun, Moon, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { setUserData } from "../redux/userSlice";
import { Button } from "@/components/ui/button";
import { useTheme } from "../hooks/useTheme";
import BrandLogo from "./BrandLogo";

function QuizNav() {
  const { user } = useSelector((state) => state.user);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-sm transition-colors duration-200">
      <div className="w-full px-4 md:px-8 h-16 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* LOGO */}
          <div
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer"
          >
            <BrandLogo size="sm" showSubtitle={false} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 relative">
          {/* DARK MODE */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* CREDITS */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCreditPopup(!showCreditPopup);
                setShowUserPopup(false);
              }}
              className="flex items-center gap-2 bg-surface-2 border border-border text-text px-3 h-9 rounded-lg hover:border-primary/40 transition-colors cursor-pointer text-xs font-semibold"
            >
              <Coins className="w-4 h-4 text-accent" />
              <span>{user?.credits ?? 0}</span>
            </button>

            {showCreditPopup && (
              <div className="absolute right-0 mt-2 w-64 bg-surface border border-border shadow-card rounded-xl p-4 z-50 animate-in fade-in zoom-in-95">
                <p className="text-xs text-text-muted mb-3">
                  Need more credits to continue AI practice interviews?
                </p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="w-full bg-primary hover:bg-primary-hover text-on-primary py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center font-semibold text-xs border border-primary/20 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.fullName?.slice(0, 1).toUpperCase() || "U"
                )}
              </div>
              <span className="hidden md:block text-xs font-medium text-text">
                {user?.fullName || "Guest"}
              </span>
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border shadow-card rounded-xl p-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => navigate("/history")}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-surface-2 text-text flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-text-subtle" />
                  Interview History
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg flex items-center gap-2 text-danger hover:bg-danger-soft transition-colors cursor-pointer mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default QuizNav;
