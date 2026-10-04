import React, { useState, useEffect } from "react";

import {
  Menu,
  Moon,
  Sun,
  Monitor,
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
import useTheme from "../hooks/useTheme";

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
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const user = useSelector((state) => state.user.user);
  const isAuth = useSelector((state) => state.user.isAuth);
  const credits = useSelector((state) => state.user.user?.credits ?? 0);
  const loading = useSelector((state) => state.user.loading);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

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

  // Overflow control for mobile menu
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

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
      <nav className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border shadow-soft transition-colors duration-200 flex items-center justify-between z-50">
        {/* LEFT */}
        <div className="w-full flex items-center justify-between px-4 md:px-6">
          <button
            className="lg:hidden p-2 rounded-lg transition-colors hover:bg-surface-2 text-text cursor-pointer"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-6">
            <div
              onClick={() => navigate("/dashboard")}
              className="cursor-pointer"
            >
              <BrandLogo />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2.5 px-4 md:px-6">
          {/* THEME TOGGLE: LIGHT / DARK / SYSTEM */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg border border-border bg-surface text-text hover:bg-surface-2 transition-colors cursor-pointer"
                title={`Theme: ${theme}`}
                aria-label="Theme selector"
              >
                {theme === "system" ? (
                  <Monitor className="h-4 w-4 text-text-muted" />
                ) : isDark ? (
                  <Moon className="h-4 w-4 text-text-muted" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 bg-surface border-border text-text shadow-subtle rounded-lg">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className={`cursor-pointer flex items-center gap-2 text-sm px-3 py-2 ${
                  theme === "light" ? "text-primary font-semibold bg-surface-2" : "text-text"
                }`}
              >
                <Sun className="h-4 w-4 text-amber-500" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className={`cursor-pointer flex items-center gap-2 text-sm px-3 py-2 ${
                  theme === "dark" ? "text-primary font-semibold bg-surface-2" : "text-text"
                }`}
              >
                <Moon className="h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className={`cursor-pointer flex items-center gap-2 text-sm px-3 py-2 ${
                  theme === "system" ? "text-primary font-semibold bg-surface-2" : "text-text"
                }`}
              >
                <Monitor className="h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                  className="flex items-center gap-1.5 sm:gap-2 bg-surface-2 border border-border px-3 py-1.5 rounded-full hover:bg-surface transition-colors cursor-pointer"
                  title="Credit Wallet"
                >
                  <BsCoin className="text-accent" size={15} />

                  <span
                    key={credits}
                    className="text-xs sm:text-sm font-semibold text-text"
                  >
                    {isLoading ? "..." : credits}
                  </span>
                </button>

                {showCreditPopup && (
                  <div
                    className="absolute right-0 mt-3 
    w-[340px]
    bg-surface
    border border-border
    shadow-subtle rounded-xl
    p-5
    z-50 animate-in fade-in zoom-in-95 duration-200"
                  >
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-base font-bold text-text">
                          Credit Wallet
                        </h3>

                        <p className="text-xs text-text-muted">
                          Manage credits & view history
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
                        <BsCoin className="text-lg" />
                      </div>
                    </div>

                    {/* CREDIT CARD */}
                    <div className="rounded-xl bg-primary p-5 text-on-primary shadow-soft">
                      <p className="text-xs opacity-90 font-medium">Available Credits</p>

                      <h2 className="text-3xl font-bold mt-1">{credits}</h2>

                      <div className="mt-4 flex items-center gap-2 text-xs opacity-90">
                        <Receipt className="w-3.5 h-3.5" />
                        Last transactions available below
                      </div>
                    </div>

                    {/* HISTORY */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                          Recent Transactions
                        </h4>

                        <button
                          onClick={() => {
                            navigate("/payments");
                            setShowCreditPopup(false);
                          }}
                          className="text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                        >
                          View All
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {loadingPayments ? (
                          <div className="text-xs text-center py-6 text-text-muted">
                            Loading history...
                          </div>
                        ) : paymentHistory.length === 0 ? (
                          <div className="text-xs text-center py-6 text-text-muted">
                            No payment history found
                          </div>
                        ) : (
                          paymentHistory.map((p) => (
                            <div
                              key={p.id}
                              className="rounded-lg border border-border bg-surface-2 p-2.5 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-9 h-9 rounded-md flex items-center justify-center ${
                                      p.status === "paid" ? "bg-success-soft text-success" : "bg-warning/10 text-warning"
                                    }`}
                                  >
                                    {p.status === "paid" ? (
                                      <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                      <Clock3 className="w-4 h-4" />
                                    )}
                                  </div>

                                  <div>
                                    <p className="font-medium text-xs text-text">
                                      {p.planId || p.plan_id || "Credits"}
                                    </p>

                                    <p className="text-[11px] text-text-muted">
                                      {new Date(p.createdAt || p.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="font-semibold text-xs text-text">
                                    ₹{p.amount}
                                  </p>

                                  {p.credits_added || p.status === "paid" ? (
                                    <p className="text-[11px] text-success font-medium">
                                      +{p.credits} credits added
                                    </p>
                                  ) : p.status === "failed" ? (
                                    <p className="text-[11px] text-danger font-medium">
                                      Credits not added
                                    </p>
                                  ) : (
                                    <p className="text-[11px] text-warning font-medium">
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
                      className="w-full mt-5 h-10 rounded-lg 
      bg-primary hover:bg-primary-hover
      text-on-primary font-medium text-sm transition-colors shadow-soft"
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

              <DropdownMenuContent align="end" className="w-80 min-w-72 md:w-96 bg-surface border border-border text-text shadow-subtle rounded-xl">
                {/* User Header */}
                <div className="p-4 pb-2 border-b border-border">
                  <div className="font-bold text-lg text-text">{user?.fullName}</div>
                  <div className="text-sm text-text-muted">Level {user?.level}</div>
                </div>

                <DropdownMenuItem
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer mx-1 my-1 rounded-lg focus:bg-surface-2 focus:text-text text-text font-medium"
                >
                  Profile
                </DropdownMenuItem>

                {/* Notifications Section */}
                <DropdownMenuLabel className="flex items-center justify-between p-2 text-text-muted text-xs uppercase tracking-wider">
                  <span>Notifications ({notifications.length})</span>
                  {notifications.length > 0 && (
                    <Badge className="h-4 w-4 p-0 text-xs font-bold bg-danger text-white border-2 border-surface">
                      {notifications.length}
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <div className="px-2 py-1 max-h-48 overflow-y-auto">
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      className="py-1.5 px-2 text-xs hover:bg-surface-2 rounded-md cursor-default mb-1 last:mb-0 border-b border-border last:border-b-0"
                    >
                      <p className="font-medium text-text">{n.message}</p>
                      <span className="text-xs text-text-muted block">{n.time}</span>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="py-2 px-2 text-xs text-text-muted text-center cursor-default">
                      No new notifications
                    </div>
                  )}
                </div>

                <DropdownMenuSeparator className="bg-border" />

                {isAuth && (
                  <>
                    <DropdownMenuLabel className="p-2 flex items-center gap-2 border border-border rounded-lg mx-1 my-1 bg-surface-2">
                      <BsCoin className="text-accent h-4 w-4" />
                      <span className="font-semibold text-text">{credits} Credits</span>
                    </DropdownMenuLabel>

                    <DropdownMenuItem
                      onClick={() => navigate("/pricing")}
                      className="cursor-pointer focus:bg-surface-2 focus:text-text text-text px-2 py-1.5 mx-1 rounded-lg"
                    >
                      Buy More Credits
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate("/settingsAction")}
                      className="cursor-pointer focus:bg-surface-2 focus:text-text text-text px-2 py-1.5 mx-1 rounded-lg"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Security
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="bg-border" />

                {(user?.role === "admin" || user?.role === "superadmin") && (
                  <DropdownMenuItem
                    onClick={() => navigate("/admin/dashboard")}
                    className="cursor-pointer focus:bg-surface-2 focus:text-text text-text mx-1 rounded-lg"
                  >
                    🛠 Admin Dashboard
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer focus:bg-danger-soft focus:text-danger text-text mx-1 rounded-lg"
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

      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-surface border-r border-border shadow-soft p-5 flex-col z-40 overflow-y-auto scrollbar-hide">
        {/* MAIN Section */}
        <div className="space-y-1 mb-6">
          <div className="text-xs font-semibold text-text-subtle uppercase px-3 mb-2 tracking-wider">
            Main
          </div>
          {[menuItems[0], menuItems[1], menuItems[2], menuItems[3]].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary-soft text-primary font-medium"
                    : "text-text-muted hover:text-text hover:bg-surface-2"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-text-subtle group-hover:text-text"}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* TOOLS Section */}
        <div className="space-y-1">
          <div className="text-xs font-semibold text-text-subtle uppercase px-3 mb-2 tracking-wider">
            Tools
          </div>
          {menuItems.slice(4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive
                    ? "bg-primary-soft text-primary font-medium"
                    : "text-text-muted hover:text-text hover:bg-surface-2"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-text-subtle group-hover:text-text"}`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 space-y-3">
          {/* Streak */}
          <div className="p-2.5 rounded-lg bg-accent-soft border border-accent/20 flex items-center gap-2.5 text-accent">
            <Flame className="w-4 h-4 shrink-0 text-accent" />
            <div className="text-xs">
              <span className="font-bold">{user?.streakCount || 0}</span>
              <span className="text-text-muted ml-1">Day Streak</span>
            </div>
          </div>

          {/* User Card */}
          <div className="p-2.5 rounded-lg bg-surface-2 border border-border flex items-center gap-2.5">
            {user?.avatar && user.avatar !== "null" ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                {getInitials(user?.fullName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium text-xs text-text truncate" title={user?.fullName}>
                {user?.fullName}
              </div>
              <div className="text-[11px] text-text-subtle">Level {user?.level}</div>
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
          <div className="fixed top-0 left-0 w-[85%] max-w-xs h-screen bg-surface z-50 shadow-subtle animate-in slide-in-from-left duration-200 border-r border-border flex flex-col text-text">
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div
                onClick={() => {
                  navigate("/dashboard");
                  setMobileOpen(false);
                }}
                className="cursor-pointer"
              >
                <BrandLogo size="sm" showSubtitle={false} />
              </div>

              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer text-text"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
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
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface-2 border border-border hover:border-primary/40 transition-colors text-left"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="font-semibold text-sm text-text truncate">{user?.fullName}</p>
                  <p className="text-xs text-text-muted">View Profile</p>
                </div>
              </button>

              {/* MENU ITEMS */}
              <div className="space-y-1 pt-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        navigate(item.path);
                        setMobileOpen(false);
                      }}
                      className={`group flex items-center gap-3 p-2.5 w-full text-left rounded-lg text-sm transition-colors cursor-pointer ${
                        isActive
                          ? "bg-primary-soft text-primary font-medium"
                          : "text-text-muted hover:text-text hover:bg-surface-2"
                      }`}
                    >
                      <item.icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-primary" : "text-text-subtle group-hover:text-text"
                        }`}
                      />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* STREAK */}
              <div className="mt-4 p-3 rounded-lg bg-accent-soft border border-accent/20 flex items-center gap-3 text-accent">
                <Flame className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="font-bold text-sm text-text">
                    {user?.streakCount || 0} Day Streak
                  </p>
                  <p className="text-xs text-text-muted">Keep learning daily 🔥</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
