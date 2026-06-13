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
  Code,
  Puzzle,
  Flame,
  Zap,
  Bell,
  MessageSquare,
  Brain,
  ListTodo,
  Bot,
  Mic,
  Ticket,
  Users,
  Receipt,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { BsCoin } from "react-icons/bs";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { Shield } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/userSlice";
import api from "../services/api";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Badge } from "@/components/ui/badge";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { socket } from "../socket";

export default function Navbar() {
  const user = useSelector((state) => state.user.user);
  const isAuth = useSelector((state) => state.user.isAuth);
  const credits = useSelector((state) => state.user.user?.credits ?? 0);
  const loading = useSelector((state) => state.user.loading);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [showThemePopup, setShowThemePopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ icon: null, title: "", subtitle: "" });

  useEffect(() => {
    if (!isAuth || !user?._id) return;

    socket.emit("join", user._id);

    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    socket.on("online_users", (count) => {
      // Global online can be used here if needed
    });

    return () => {
      socket.off("notification");
      socket.off("online_users");
    };
  }, [isAuth, user?._id]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  // Sync dark mode state
  useEffect(() => {
    const handleThemeChange = () => {
      const dark = document.documentElement.classList.contains("dark");
      setIsDark(dark);
    };

    window.addEventListener("storage", handleThemeChange);
    handleThemeChange(); // Initial check

    return () => window.removeEventListener("storage", handleThemeChange);
  }, []);

  const toggleDark = () => {
    const wasDark = isDark;
    const isNowDark = document.documentElement.classList.toggle("dark");
    setIsDark(isNowDark);
    localStorage.setItem("theme", isNowDark ? "dark" : "light");

    // Show premium popup
    setPopupContent({
      icon: isNowDark ? Moon : Sun,
      title: isNowDark ? "Dark Mode Enabled" : "Light Mode Enabled",
      subtitle: isNowDark ? "Night vibes activated 🌙" : "Sunshine is back ☀️",
    });
    setShowThemePopup(true);

    // Auto-hide after 2s
    setTimeout(() => setShowThemePopup(false), 2000);
  };

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

  useEffect(() => {
    const loadPayments = async () => {
      if (!isAuth) return;

      try {
        setLoadingPayments(true);

        const res = await api.get("/api/payment/me?page=1&limit=4");

        setPaymentHistory(res.data?.data?.payments || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingPayments(false);
      }
    };

    loadPayments();
  }, [isAuth]);

  const handleLogout = async () => {
    try {
      await api.get("/api/auth/signout", {
        withCredentials: true,
      });

      dispatch(logoutUser());
      navigate("/");
    } catch (err) {}
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: ListTodo, label: "TaskBoard", path: "/dashboard/tasks" },
    { icon: Building2, label: "All Companies", path: "/companies" },
    { icon: BookOpen, label: "Interview Practice", path: "/quiz" },
    { icon: Briefcase, label: "Jobs", path: "/jobs" },
    { icon: Sparkles, label: "AI Planner", path: "/ai-planner" },
    { icon: Calendar, label: "Planner History", path: "/planner-history" },
    { icon: FileText, label: "AI Analyzer", path: "/resume-analyzer" },
    { icon: Code, label: "Code Compiler", path: "/code-editor" },
    { icon: Puzzle, label: "Fruitbox Flex", path: "/dashboard/fruitbox-flex" },
    { icon: BookOpen, label: "AI Notes", path: "/notes" },
    { icon: Users, label: "Interview Experience", path: "/interview-experience" },
    { icon: MessageSquare, label: "Community", path: "/doubts" },
    { icon: Zap, label: "Resume Generator", path: "/resume-generator" },
    { icon: Bot, label: "AI Coach", path: "/ai-coach" },
    { icon: Mic, label: "AI Voice Coach", path: "/ai-voice-coach" },
    { icon: Brain, label: "YouTube Summary", path: "/youtube-summary" },
    { icon: BookOpen, label: "DSA Resources", path: "/resources" },

    { icon: Trophy, label: "Leaderboard", path: "/leaderboard" },
    { icon: Ticket, label: "Support", path: "/support" },
  ];

  const isLoading = loading;
  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 shadow-md dark:shadow-black/20 transition-colors duration-300 flex items-center justify-between z-50">
        {/* LEFT */}
        <div className="w-full flex items-center justify-between px-4 md:px-6">
          {" "}
          <button
            className="lg:hidden p-2 rounded-xl transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 cursor-pointer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </button>
          <div className="flex items-center gap-6">
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
            {/* Desktop Links */}
            <div className="hidden lg:flex gap-6 lg:ml-21">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/jobs">Jobs</Link>
              <Link to="/code-editor">Code Compiler</Link>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* 🌙 PREMIUM THEME TOGGLE */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDark}
              className="group relative p-2 hover:scale-110 transition-all duration-300 hover:rotate-12 shadow-md hover:shadow-lg bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 dark:hover:from-slate-700 dark:hover:to-slate-600 rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 rounded-xl blur-sm transition-all duration-300" />
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-500 relative z-10 drop-shadow-lg" />
              ) : (
                <Moon className="h-5 w-5 text-slate-400 relative z-10 drop-shadow-lg" />
              )}
            </Button>

            {/* Premium Popup Card */}
            {showThemePopup && (
              <div
                className="absolute top-full right-0 mt-2 w-64 p-5 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 
                bg-white/95 dark:bg-slate-900/95 
                text-slate-900 dark:text-white 
                border border-slate-200/50 dark:border-slate-700/50
                backdrop-blur-xl
                shadow-2xl dark:shadow-slate-900/30"
              >
                <div className="relative flex items-center gap-3">
                  <div
                    className={`p-2.5 bg-gradient-to-br rounded-xl shadow-lg flex-shrink-0 ${
                      isDark
                        ? "from-slate-600 to-slate-800 bg-slate-600/50 animate-pulse"
                        : "from-amber-400 to-orange-400 bg-amber-400/50 animate-sparkle"
                    }`}
                  >
                    {popupContent.icon ? <popupContent.icon className="h-6 w-6" /> : null}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{popupContent.title}</h3>
                    <p className="text-sm opacity-90 font-medium">{popupContent.subtitle}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* DESKTOP-ONLY ELEMENTS */}
          <div className="hidden lg:flex items-center gap-3">
            {/*  NOTIFICATION BELL */}
            {isAuth && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => {
                    if (showNotif) {
                      setShowNotif(false);
                      setNotifications([]);
                    } else {
                      setShowNotif(true);
                    }
                  }}
                >
                  <Bell size={20} />
                  {notifications.length > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 
h-5 w-5 p-0 
flex items-center justify-center 
text-[10px] font-bold 
bg-red-500 text-white 
border-2 border-white dark:border-gray-900 
rounded-full"
                    >
                      {notifications.length}
                    </Badge>
                  )}
                </Button>

                {showNotif && (
                  <div
                    className="absolute right-0 mt-2 w-80 
bg-white dark:bg-gray-900 
border border-gray-200 dark:border-white/10 
shadow-lg rounded-xl p-3 z-50 max-h-96 overflow-y-auto"
                  >
                    <h3 className="font-semibold mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white">
                      Notifications
                    </h3>
                    {notifications.map((n, i) => (
                      <div
                        key={i}
                        className="py-2 border-b border-gray-200 dark:border-gray-700 
text-sm hover:bg-gray-50 dark:hover:bg-gray-800 
p-2 rounded"
                      >
                        <p>{n.message}</p>
                        <span className="text-xs text-gray-500 block mt-1">{n.time}</span>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-gray-500 text-sm">No new notifications</p>
                    )}
                  </div>
                )}
              </div>
            )}

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

                  <span
                    key={credits}
                    className="text-xs sm:text-sm md:text-base font-semibold dark:text-black"
                  >
                    {isLoading ? "..." : credits}
                  </span>
                </button>

                {showCreditPopup && (
                  <div
                    className="absolute right-0 mt-3 
    w-[340px]
    bg-white dark:bg-[#0B1120]
    border border-gray-200 dark:border-white/10
    shadow-2xl rounded-3xl
    p-5
    z-50 animate-in fade-in zoom-in-95 duration-300"
                  >
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Credit Wallet
                        </h3>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Manage credits & view history
                        </p>
                      </div>

                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <BsCoin className="text-white text-lg" />
                      </div>
                    </div>

                    {/* CREDIT CARD */}
                    <div className="rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white shadow-xl">
                      <p className="text-sm opacity-80">Available Credits</p>

                      <h2 className="text-4xl font-black mt-2">{credits}</h2>

                      <div className="mt-4 flex items-center gap-2 text-xs opacity-80">
                        <Receipt className="w-4 h-4" />
                        Last transactions available below
                      </div>
                    </div>

                    {/* HISTORY */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Recent Transactions
                        </h4>

                        <button
                          onClick={() => {
                            navigate("/payments");
                            setShowCreditPopup(false);
                          }}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition"
                        >
                          View All
                        </button>
                      </div>

                      <div className="space-y-3 max-h-[230px] overflow-y-auto pr-1">
                        {loadingPayments ? (
                          <div className="text-sm text-center py-6 text-gray-500">
                            Loading history...
                          </div>
                        ) : paymentHistory.length === 0 ? (
                          <div className="text-sm text-center py-6 text-gray-500 dark:text-gray-400">
                            No payment history found
                          </div>
                        ) : (
                          paymentHistory.map((p) => (
                            <div
                              key={p.id}
                              className="rounded-2xl border border-gray-200 dark:border-white/10 
              bg-gray-50 dark:bg-white/5 
              p-3 hover:shadow-md transition"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                      p.status === "paid" ? "bg-green-500/10" : "bg-yellow-500/10"
                                    }`}
                                  >
                                    {p.status === "paid" ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : (
                                      <Clock3 className="w-5 h-5 text-yellow-500" />
                                    )}
                                  </div>

                                  <div>
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                                      {p.planId || p.plan_id || "Credits"}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                      {new Date(p.createdAt || p.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                                    ₹{p.amount}
                                  </p>

                                  {p.credits_added || p.status === "paid" ? (
                                    <p className="text-xs text-green-500 font-medium">
                                      +{p.credits} credits added
                                    </p>
                                  ) : p.status === "failed" ? (
                                    <p className="text-xs text-red-500 font-medium">
                                      Credits not added
                                    </p>
                                  ) : (
                                    <p className="text-xs text-yellow-500 font-medium">
                                      Credits pending
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* ACTION BUTTON */}
                    <button
                      onClick={() => navigate("/pricing")}
                      className="w-full mt-5 h-12 rounded-2xl 
      bg-gradient-to-r from-indigo-600 to-purple-600 
      hover:opacity-90
      text-white font-semibold transition-all duration-300 shadow-lg"
                    >
                      Buy More Credits
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE: AVATAR ONLY */}

          {/* USER */}
          {isAuth ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="ml-auto lg:ml-0 cursor-pointer">
                <Avatar>
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-80 min-w-72 md:w-96">
                {/* User Header */}
                <div className="p-4 pb-2 border-b">
                  <div className="font-bold text-lg">{user?.fullName}</div>
                  <div className="text-sm text-gray-500">Level {user?.level}</div>
                </div>

                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="border-2 focus:bg-blue-500 cursor-pointer"
                >
                  Profile
                </DropdownMenuItem>

                {/* Notifications Section */}
                <DropdownMenuLabel className="flex items-center justify-between p-2">
                  <span>Notifications ({notifications.length})</span>
                  {notifications.length > 0 && (
                    <Badge className="h-4 w-4 p-0 text-xs font-bold bg-red-500 border-2 border-white">
                      {notifications.length}
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <div className="px-2 py-1 max-h-48 overflow-y-auto ">
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      className="py-1.5 px-2 text-xs hover:bg-gray-50 rounded-md cursor-default mb-1 last:mb-0 border-b border-b-gray-100 last:border-b-0"
                    >
                      <p className="font-medium">{n.message}</p>
                      <span className="text-xs text-gray-500 block">{n.time}</span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="py-2 px-2 text-xs text-gray-500 text-center cursor-default">
                      No new notifications
                    </div>
                  )}
                </div>

                <DropdownMenuSeparator />

                {isAuth && (
                  <>
                    <DropdownMenuLabel className="p-2 flex items-center gap-2 border-2">
                      <BsCoin className="text-yellow-600 h-4 w-4" />
                      <span className="font-semibold">{credits} Credits</span>
                    </DropdownMenuLabel>

                    <DropdownMenuItem
                      onClick={() => navigate("/pricing")}
                      className="focus:bg-blue-500 px-2 py-1.5"
                    >
                      Buy More Credits
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate("/settingsAction")}
                      className="focus:bg-blue-500 px-2 py-1.5"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Security
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuSeparator />

                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                    Admin Panel
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="focus:bg-blue-500 hover:cursor-pointer"
                >
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

      {/* DESKTOP SIDEBAR - IMPROVED */}
      <div className="hidden lg:flex fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-background/80 backdrop-blur-lg border-r shadow-sm p-6 flex-col z-40 overflow-y-auto scrollbar-hide">
        {/* MAIN Section */}
        <div className="space-y-3 mb-8">
          <div className="text-xs font-semibold text-muted-foreground uppercase px-3 mt-1 mb-2 tracking-wider">
            Main
          </div>
          {[menuItems[0], menuItems[1], menuItems[2], menuItems[3]].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-blue-100 hover:-translate-x-1 hover:shadow-md ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg relative shadow-blue-200 before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-7 before:bg-white before:rounded-sm before:shadow-sm scale-[1.02]"
                    : "text-foreground hover:text-blue-700"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-blue-600 transition-colors"}`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* TOOLS Section */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase px-3 mt-4 mb-2 tracking-wider">
            Tools
          </div>
          {menuItems.slice(4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-blue-50 hover:-translate-x-1 hover:shadow-md ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg relative shadow-blue-200 before:absolute before:left-1 before:top-1/2 before:-translate-y-1/2 before:w-1.5 before:h-7 before:bg-white before:rounded-sm before:shadow-sm scale-[1.02]"
                    : "text-foreground hover:text-blue-700"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 ${isActive ? "text-blue-600" : "text-muted-foreground group-hover:text-blue-600 transition-colors"}`}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-8 space-y-4">
          {/* Streak */}
          <div className="p-3 rounded-xl bg-linear-to-r from-orange-500/10 to-orange-400/10 border border-orange-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-200">
            <Flame className="w-5 h-5 text-orange-500 shrink-0" />
            <div>
              <span className="font-bold text-sm">{user?.streakCount || 0}</span>
              <span className="text-sm text-muted-foreground ml-1">Day Streak</span>
            </div>
          </div>

          {/* User Card */}
          <div className="p-3 rounded-xl bg-muted/50 backdrop-blur-sm flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-200 border border-border/50">
            {user?.avatar && user.avatar !== "null" ? (
              <img
                src={user.avatar}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-muted/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-muted/50">
                {getInitials(user?.fullName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate" title={user?.fullName}>
                {user?.fullName}
              </div>
              <div className="text-xs text-muted-foreground">Level {user?.level}</div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <>
          {/* BACKDROP */}
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />

          {/* SIDEBAR */}
          <div className="fixed top-0 left-0 w-[85%] max-w-xs h-screen bg-white dark:bg-gray-900 z-50 shadow-2xl animate-in slide-in-from-left duration-300 border-r border-gray-200 dark:border-gray-800 flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <span className="font-bold text-lg dark:text-white">Menu</span>

              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition cursor-pointer"
              >
                <X />
              </button>
            </div>

            {/* SCROLL AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* PROFILE CARD */}
              <button
                onClick={() => {
                  navigate("/profile");
                  setMobileOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] transition text-left"
              >
                <Avatar className="h-11 w-11">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="font-semibold text-sm dark:text-white truncate">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">View Profile</p>
                </div>
              </button>

              {/* MENU ITEMS */}
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    className={`group flex items-center gap-3 p-3 w-full text-left rounded-xl transition-all duration-300 cursor-pointer
              ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 active:bg-blue-100 dark:active:bg-gray-700"
              }
              active:scale-[0.98]`}
                  >
                    <item.icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    {item.label}
                  </button>
                );
              })}

              {/* STREAK */}
              <div className="mt-4 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-500 shrink-0" />
                <div>
                  <p className="font-bold text-sm dark:text-white">
                    {user?.streakCount || 0} Day Streak
                  </p>
                  <p className="text-xs text-gray-500">Keep learning daily 🔥</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
