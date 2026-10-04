import Navbar from "@/components/Navbar";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../hooks/useAnalytics";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import CpotdCard from "@/components/CpotdCard";
import DashboardQuoteCard from "@/components/DashboardQuoteCard";
import Footer from "@/components/Footer";
import PotdCard from "@/components/PotdCard";
import SuccessStories from "@/components/SuccessStories";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import {
  ArrowRight,
  Briefcase,
  ExternalLink,
  Loader2,
  Mic,
  Play,
  TrendingUp,
  Sparkles,
  Zap,
  FileText,
} from "lucide-react";
import api from "../services/api";

import ContactUs from "@/components/ContactUs";
import StreakCalendar from "@/components/StreakCalendar.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { fetchNews, fetchNewsStats } from "../redux/newsSlice.js";
import { fetchStreak } from "../redux/streakSlice.js";
import WordOfDayCard from "@/components/WordOfDayCard";
import { useQueryClient } from "@tanstack/react-query";
import AnnouncementBar from "../components/AnnouncementBar";
import useSettings from "../hooks/useSettings";

import {
  safeTrack,
  startCriticalReplay,
  stopReplaySuccess,
} from "../observability/openreplay/events";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.user);
  const { data: settings } = useSettings();

  const navigate = useNavigate();

  const [weeklyData, setWeeklyData] = React.useState([]);

  const [unlockedBadges, setUnlockedBadges] = React.useState([]);
  const [motivation, setMotivation] = React.useState("");
  const [loadingMotivation, setLoadingMotivation] = React.useState(true);

  // News
  const dispatch = useDispatch();
  const {
    news,
    loading: newsLoading,
    error: newsError,
    stats,
    statsLoading,
  } = useSelector((state) => state.news);
  const [activeFilter, setActiveFilter] = React.useState("all");

  const streak = user?.streakCount || 0;

  const totalXP = user?.xp || 0;

  //  XP required for current level
  const level = user?.level || 1;

  const currentXP = user?.currentLevelXP || 0;

  // Level based required XP
  const maxXP = level * 100;

  const percent = Math.min(Math.max((currentXP / maxXP) * 100, 0), 100);

  const companies = [
    {
      name: "Google",
      role: "Software Engineer",
      rating: "4.8",
      logo: "https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png",
    },
    {
      name: "Microsoft",
      role: "Cloud Architect",
      rating: "4.7",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    },
    {
      name: "Amazon",
      role: "SDE-II",
      rating: "4.5",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    },
    {
      name: "Apple",
      role: "iOS Developer",
      rating: "4.9",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    },
    {
      name: "Meta",
      role: "Product Manager",
      rating: "4.6",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    },
    {
      name: "Netflix",
      role: "UI/UX Designer",
      rating: "4.7",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    },
    {
      name: "Tesla",
      role: "Hardware Engineer",
      rating: "4.3",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg",
    },
    {
      name: "Spotify",
      role: "Data Scientist",
      rating: "4.8",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    },
    {
      name: "Adobe",
      role: "Product Designer",
      rating: "4.6",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Adobe_Inc._logo_2020.svg",
    },
    {
      name: "LinkedIn",
      role: "Full Stack Developer",
      rating: "4.5",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
    },
    {
      name: "Uber",
      role: "Backend Engineer",
      rating: "4.4",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
    },
    {
      name: "Airbnb",
      role: "Frontend Engineer",
      rating: "4.7",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Belo.svg",
    },
    {
      name: "NVIDIA",
      role: "AI Researcher",
      rating: "4.9",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
    },
    {
      name: "Slack",
      role: "DevOps Engineer",
      rating: "4.6",
      logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
    },
    {
      name: "PayPal",
      role: "Fintech Analyst",
      rating: "4.4",
      logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
    },
  ];

  const plugin = Autoplay({ delay: 3000, stopOnInteraction: false });

  const playSound = () => {
    const audio = new Audio("/sounds/badge.mp3");
    audio.play();
  };

  useEffect(() => {
    safeTrack("dashboard_opened", {
      role: user?.role,
      level: user?.level,
    });

    startCriticalReplay("dashboard", {
      role: user?.role,
    });

    return () => {
      stopReplaySuccess("dashboard");
    };
  }, []);
  // ================= FIXED TIME TRACK =================
  useEffect(() => {
    let interval;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        interval = setInterval(() => {
          api.post("/api/xp/time", { minutes: 1 });
        }, 60000);
      } else {
        clearInterval(interval);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    handleVisibility();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  React.useEffect(() => {
    const fetchWeekly = async () => {
      try {
        const res = await api.get("/api/dashboard/weekly", {
          withCredentials: true,
        });

        // date ko short form me convert (Mon, Tue...)
        const formatted = (res.data?.weeklyData || []).map((item) => ({
          ...item,
          date: item.date, //  FIX (NO conversion)
        }));

        setWeeklyData(formatted);
        safeTrack("dashboard_weekly_loaded", {
          count: formatted?.length || 0,
        });

        stopReplaySuccess("dashboard");
      } catch (err) {
        safeTrack("dashboard_weekly_failed", {
          error: err?.message,
        });

        startCriticalReplay("dashboard_failed", {
          error: err?.message,
        });
      }
    };

    fetchWeekly();
  }, []);

  // Fetch motivation message
  React.useEffect(() => {
    const fetchMotivation = async () => {
      try {
        setLoadingMotivation(true);

        const res = await api.get("/api/ai/motivation", {
          withCredentials: true,
        });

        const message = res.data.message || "Keep pushing forward! 🚀";

        setMotivation(message);
        safeTrack("motivation_loaded", {});
      } catch (err) {
        console.error("Motivation fetch error:", err);
        safeTrack("motivation_failed", {
          error: err?.message,
        });
        setMotivation("Stay consistent, you're doing great! 💪");
      } finally {
        setLoadingMotivation(false);
      }
    };

    if (user?._id) {
      // Only if logged in
      fetchMotivation();
    }
  }, [user?._id]);

  // Fetch news + stats
  React.useEffect(() => {
    dispatch(fetchNewsStats());
    dispatch(fetchStreak());
    dispatch(
      fetchNews({
        tag: activeFilter === "all" ? undefined : activeFilter,
        limit: 50,
      })
    );
  }, [dispatch, activeFilter]);

  const getBestDay = (data) => {
    if (!Array.isArray(data) || data.length === 0) return "—";

    const best = [...data].sort((a, b) => {
      const av = Number(a?.avgScore ?? 0);
      const bv = Number(b?.avgScore ?? 0);
      return bv - av;
    })[0];

    // Input date format appears to already be the chart key (likely Mon/Tue etc.)
    // Fallback to raw date.
    return best?.date || "—";
  };

  const getScoreImprovement = (data) => {
    if (!Array.isArray(data) || data.length < 2) return null;

    // Compare first half vs second half within weeklyData.
    const mid = Math.floor(data.length / 2);
    const prev = data.slice(0, mid);
    const curr = data.slice(mid);

    const prevAvg = prev.reduce((sum, d) => sum + Number(d?.avgScore ?? 0), 0) / (prev.length || 1);
    const currAvg = curr.reduce((sum, d) => sum + Number(d?.avgScore ?? 0), 0) / (curr.length || 1);

    if (prevAvg === 0) return null;
    return Math.round(((currAvg - prevAvg) / prevAvg) * 100);
  };

  const getTimeImprovement = (data) => {
    if (!Array.isArray(data) || data.length < 2) return null;

    const mid = Math.floor(data.length / 2);
    const prev = data.slice(0, mid);
    const curr = data.slice(mid);

    const prevAvg =
      prev.reduce((sum, d) => sum + Number(d?.timeSpent ?? 0), 0) / (prev.length || 1);
    const currAvg =
      curr.reduce((sum, d) => sum + Number(d?.timeSpent ?? 0), 0) / (curr.length || 1);

    if (prevAvg === 0) return null;
    return Math.round(((currAvg - prevAvg) / prevAvg) * 100);
  };

  const getInsightMessage = (scoreImprovementPct) => {
    if (scoreImprovementPct === null) {
      return "Your consistency is growing. Keep showing up daily.";
    }

    if (scoreImprovementPct > 0) {
      return "Your consistency is improving. Keep practicing daily.";
    }

    if (scoreImprovementPct < 0) {
      return "Focus on small daily practice sessions—your streak can bounce back.";
    }

    return "Steady progress—try adding a short revision session to level up faster.";
  };

  // Existing KPI used by current Weekly Performance badge
  const calculateWeeklyChange = () => {
    if (!weeklyData || weeklyData.length === 0) return 0;

    const currentAvg = Number(
      (weeklyData.reduce((sum, d) => sum + Number(d.avgScore), 0) / weeklyData.length).toFixed(2)
    );

    const previousAvg =
      weeklyData.slice(0, weeklyData.length - 1).reduce((sum, d) => sum + d.avgScore, 0) /
      (weeklyData.length - 1 || 1);

    //  FIX HERE
    if (previousAvg === 0) {
      return null; // special case
    }

    return Math.round(((currentAvg - previousAvg) / previousAvg) * 100);
  };

  const percentChange = calculateWeeklyChange();

  // Weekly insight card (Feature 1)
  const bestDay = getBestDay(weeklyData);
  const scoreImprovementPct = getScoreImprovement(weeklyData);
  const timeImprovementPct = getTimeImprovement(weeklyData);

  const thisWeekColorClass =
    scoreImprovementPct === null
      ? "text-gray-900 dark:text-white"
      : scoreImprovementPct >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400";

  const timeColorClass =
    timeImprovementPct === null
      ? "text-gray-900 dark:text-white"
      : timeImprovementPct >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400";

  // Convert % change to minutes delta for display, using averages within weeklyData
  const timeDeltaMinutes = (() => {
    if (!Array.isArray(weeklyData) || weeklyData.length < 2) return null;
    const mid = Math.floor(weeklyData.length / 2);
    const prev = weeklyData.slice(0, mid);
    const curr = weeklyData.slice(mid);

    const prevAvg =
      prev.reduce((sum, d) => sum + Number(d?.timeSpent ?? 0), 0) / (prev.length || 1);
    const currAvg =
      curr.reduce((sum, d) => sum + Number(d?.timeSpent ?? 0), 0) / (curr.length || 1);

    if (!Number.isFinite(prevAvg) || !Number.isFinite(currAvg)) return null;
    return Math.round(currAvg - prevAvg);
  })();

  const insightMessage = getInsightMessage(scoreImprovementPct);

  const today = new Date().toISOString().split("T")[0];

  const todayData =
    weeklyData.find((d) => d.date === today) || weeklyData[weeklyData.length - 1] || {};

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // ======================================================

  return (
    <>
      <Navbar />
      {settings?.data?.announcementEnabled && settings?.data?.announcementText && (
        <div className="pt-16 lg:pl-64">
          <AnnouncementBar settings={settings.data} />
        </div>
      )}

      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 bg-bg min-h-screen text-text transition-colors duration-200">
        {/* BADGE POPUP */}
        {unlockedBadges.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-surface border border-border rounded-2xl p-8 text-center animate-scaleUp shadow-subtle max-w-md mx-4">
              <h2 className="text-xl font-bold mb-3 text-text">
                New Badge Unlocked
              </h2>
              {unlockedBadges.map((badge, i) => (
                <div key={i} className="text-base font-semibold mb-2 text-primary">
                  {badge.name}
                </div>
              ))}
              <Button
                onClick={() => setUnlockedBadges([])}
                className="mt-4 bg-primary hover:bg-primary-hover text-on-primary px-6 py-2 rounded-lg font-medium"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Main Content (Max ~1200px, 24px consistent gap) */}
        <main className="max-w-[1200px] mx-auto space-y-6">
          {/* Row 1: Welcome + Daily Motivation */}
          <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6 items-stretch">
            <div className="h-full">
              <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-primary/5 border border-border rounded-2xl p-6 sm:p-7 shadow-subtle hover:shadow-card transition-all duration-300 flex flex-col justify-between h-full group">
                {/* Decorative background glows */}
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/15 transition-colors" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10">
                  {/* Top Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                      Placement Ready
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-surface-2 text-text-muted text-xs font-semibold border border-border">
                      Level {level}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-surface-2 text-text-muted text-xs font-medium border border-border">
                      ⏱️ Today: {todayData?.timeSpent || 0} min
                    </span>
                  </div>

                  {/* Greeting & Headline */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text leading-tight">
                    <span data-private>
                      {greeting},{" "}
                      <span className="bg-gradient-to-r from-primary via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                        {user?.fullName?.split(" ")[0] || user?.fullName || "Candidate"}
                      </span>
                    </span>
                    <span className="inline-block ml-1">👋</span>
                  </h1>

                  <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-lg leading-relaxed">
                    You have a{" "}
                    <span className="font-semibold text-accent">
                      {streak}-day streak
                    </span>{" "}
                    going! Complete today's daily challenges to boost your placement score.
                  </p>

                  {/* Quick stats mini-bar */}
                  <div className="grid grid-cols-3 gap-3 my-4 py-3 px-4 rounded-xl bg-surface-2/60 border border-border/80 backdrop-blur-xs">
                    <div>
                      <div className="text-[11px] font-medium text-text-subtle">Streak</div>
                      <div className="text-base sm:text-lg font-bold text-text flex items-center gap-1">
                        🔥 {streak} <span className="text-[11px] font-normal text-text-muted hidden sm:inline">days</span>
                      </div>
                    </div>
                    <div className="border-x border-border/60 px-3">
                      <div className="text-[11px] font-medium text-text-subtle">Total XP</div>
                      <div className="text-base sm:text-lg font-bold text-primary flex items-center gap-1">
                        ⭐ {totalXP}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-text-subtle">Progress</div>
                      <div className="text-base sm:text-lg font-bold text-text">
                        {Math.round(percent)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary CTA Row */}
                <div className="relative z-10 flex flex-wrap items-center gap-3 pt-1">
                  <Button
                    onClick={() => {
                      safeTrack("dashboard_quiz_clicked", {});
                      navigate("/quiz");
                    }}
                    className="bg-primary hover:bg-primary-hover text-on-primary font-semibold rounded-xl shadow-soft h-10 px-5 text-sm inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continue Quiz
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      safeTrack("placement_predictor_clicked", {});
                      navigate("/placement-predictor");
                    }}
                    className="rounded-xl border-border bg-surface/80 hover:bg-surface-2 text-text font-medium h-10 px-4 text-sm inline-flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Predict Placement
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <DashboardQuoteCard />
            </div>
          </div>

          {/* Row 2: Progress (left) + Word Of The Day (right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-6">
            <div className="h-full">
              {/* Progress (Circular level indicator) */}
              <div className="bg-surface border border-border p-6 rounded-xl shadow-subtle hover:shadow-card transition-all h-full flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-subtle mb-4">
                    Learning Progress
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    {/* LEFT XP DETAILS */}
                    <div className="flex-1 space-y-3">
                      <div className="text-2xl sm:text-3xl font-bold text-text">
                        {currentXP} <span className="text-lg font-medium text-text-subtle">/ {maxXP} XP</span>
                      </div>

                      {/* XP Progress Bar */}
                      <div className="w-full bg-surface-2 rounded-full h-2.5 border border-border overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {/* Stat pills */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-xs font-semibold text-text-muted">
                          🔥 {streak} day streak
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft border border-primary/20 text-xs font-semibold text-primary">
                          ⭐ {totalXP} total XP
                        </span>
                      </div>

                      <p className="text-xs text-text-muted leading-relaxed">
                        {loadingMotivation ? (
                          "Loading today's study goal..."
                        ) : (
                          motivation || "Complete today's challenges to maintain your momentum."
                        )}
                      </p>
                    </div>

                    {/* RIGHT - Circular Level Progress Ring */}
                    <div className="w-[130px] h-[130px] shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
                      <div className="relative w-[120px] h-[120px]">
                        {(() => {
                          const size = 120;
                          const stroke = 10;
                          const r = (size - stroke) / 2;
                          const c = 2 * Math.PI * r;
                          const pct = Math.min(Math.max(percent, 0), 100);
                          const dashOffset = c - (pct / 100) * c;

                          return (
                            <svg
                              width={size}
                              height={size}
                              viewBox={`0 0 ${size} ${size}`}
                              className="block"
                            >
                              {/* track */}
                              <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={r}
                                fill="none"
                                strokeWidth={stroke}
                                className="stroke-surface-2"
                              />

                              {/* progress */}
                              <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={r}
                                fill="none"
                                strokeWidth={stroke}
                                strokeLinecap="round"
                                className="stroke-primary"
                                strokeDasharray={c}
                                strokeDashoffset={dashOffset}
                                style={{
                                  transition: "stroke-dashoffset 900ms ease-out",
                                  transformOrigin: "50% 50%",
                                  transform: "rotate(-90deg)",
                                }}
                              />

                              {/* center text */}
                              <foreignObject x="0" y="0" width={size} height={size}>
                                <div
                                  xmlns="http://www.w3.org/1999/xhtml"
                                  className="w-full h-full flex flex-col items-center justify-center"
                                >
                                  <div className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider">
                                    Level
                                  </div>
                                  <div className="text-2xl font-bold text-text leading-none my-0.5">
                                    {level}
                                  </div>
                                  <div className="text-xs font-semibold text-primary">
                                    {Math.round(percent)}%
                                  </div>
                                </div>
                              </foreignObject>
                            </svg>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-full">
              <WordOfDayCard />
            </div>
          </div>

          {/* ======================================================
              AI PLACEMENT TOOLKIT — MODERN BENTO GRID
             ====================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-text flex items-center gap-2">
                  <span className="p-1 rounded-md bg-primary-soft text-primary">
                    <Zap className="w-4 h-4" />
                  </span>
                  AI Placement Toolkit
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Accelerate your interview preparation with intelligent tools
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* BENTO 1: AI VOICE INTERVIEW COACH (Col Span 7 on md/lg) */}
              <div
                onClick={() => {
                  safeTrack("ai_voice_coach_clicked", {});
                  navigate("/ai-voice-coach");
                }}
                className="md:col-span-7 relative overflow-hidden bg-gradient-to-br from-surface via-surface to-primary/10 border border-border hover:border-primary/50 p-6 rounded-2xl shadow-subtle hover:shadow-card cursor-pointer transition-all duration-300 group flex flex-col justify-between"
              >
                {/* Background radial glow */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/20 transition-colors" />

                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            AI Simulation
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent-soft text-accent border border-accent/20">
                            POPULAR
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                          AI Voice Interview Coach
                        </h3>
                      </div>
                    </div>

                    <div className="h-8 w-8 rounded-lg bg-surface-2 text-text-muted flex items-center justify-center group-hover:bg-primary-soft group-hover:text-primary transition-colors">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                    Speak live with an AI interviewer trained on FAANG & Tier-1 tech rounds. Receive instant speech analytics & question feedback.
                  </p>

                  {/* Live Audio Waves Mockup + Feature Tags */}
                  <div className="p-3 rounded-xl bg-surface-2/70 border border-border/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 h-6">
                      <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                      <span className="w-1 h-5 bg-teal-500 rounded-full animate-pulse delay-75" />
                      <span className="w-1 h-6 bg-emerald-400 rounded-full animate-pulse delay-150" />
                      <span className="w-1 h-4 bg-primary rounded-full animate-pulse delay-100" />
                      <span className="w-1 h-2 bg-teal-400 rounded-full animate-pulse" />
                      <span className="text-[11px] font-semibold text-text ml-2">Voice AI Active</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                      <span className="px-2 py-0.5 rounded-md bg-surface border border-border font-medium">Realtime Feedback</span>
                      <span className="px-2 py-0.5 rounded-md bg-surface border border-border font-medium hidden sm:inline">HR & Tech</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-text-subtle font-medium">Ready in 10 seconds • No setup</span>
                  <span className="font-semibold text-primary flex items-center gap-1 group-hover:underline">
                    Start Voice Mock <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* BENTO 2: PLACEMENT PREDICTOR AI (Col Span 5 on md/lg) */}
              <div
                onClick={() => {
                  safeTrack("placement_predictor_clicked", {});
                  navigate("/placement-predictor");
                }}
                className="md:col-span-5 relative overflow-hidden bg-gradient-to-br from-surface via-surface to-accent/5 border border-border hover:border-accent/50 p-6 rounded-2xl shadow-subtle hover:shadow-card cursor-pointer transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-36 h-36 bg-accent/10 rounded-full blur-2xl pointer-events-none group-hover:bg-accent/20 transition-colors" />

                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent border border-accent/25 flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                        <TrendingUp className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                          Salary & Odds
                        </span>
                        <h3 className="text-lg font-bold text-text group-hover:text-accent transition-colors">
                          Placement Predictor
                        </h3>
                      </div>
                    </div>

                    <div className="h-8 w-8 rounded-lg bg-surface-2 text-text-muted flex items-center justify-center group-hover:bg-accent-soft group-hover:text-accent transition-colors">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-4">
                    Calculate your placement chances across Product & Service companies based on your current CGPA, skills & projects.
                  </p>

                  {/* Prediction mini-preview chip */}
                  <div className="p-3 rounded-xl bg-surface-2/70 border border-border/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted">Target Compensation</span>
                      <span className="font-bold text-success">₹6 - 18 LPA</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2 border border-border overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accent to-success rounded-full w-[78%]" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-text-subtle font-medium">30-second AI assessment</span>
                  <span className="font-semibold text-accent flex items-center gap-1 group-hover:underline">
                    Predict Odds <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* BENTO 3: REAL INTERVIEW EXPERIENCES (Col Span 4) */}
              <div
                onClick={() => {
                  safeTrack("interview_experience_clicked", {});
                  navigate("/interview-experience");
                }}
                className="md:col-span-4 relative overflow-hidden bg-surface border border-border hover:border-primary/50 p-5 rounded-2xl shadow-subtle hover:shadow-card cursor-pointer transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-success-soft text-success border border-success/20">
                      NEW ARCHIVE
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">
                    Interview Archive
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Real campus rounds, coding questions & HR transcripts from placed seniors.
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["TCS", "Infosys", "Wipro", "Amazon"].map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-2 text-text-muted border border-border"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-primary font-semibold">
                  <span>Read Experiences</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* BENTO 4: AI RESUME ATS ANALYZER (Col Span 4) */}
              <div
                onClick={() => {
                  safeTrack("dashboard_resume_clicked", {});
                  navigate("/resume-analyzer");
                }}
                className="md:col-span-4 relative overflow-hidden bg-surface border border-border hover:border-primary/50 p-5 rounded-2xl shadow-subtle hover:shadow-card cursor-pointer transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary-soft text-primary border border-primary/20">
                      ATS SCANNER
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">
                    AI Resume Analyzer
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Check your resume against top ATS screeners, missing keywords & fix formatting errors.
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-2 text-text-muted border border-border">
                      ATS Score
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-2 text-text-muted border border-border">
                      Keyword Match
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-primary font-semibold">
                  <span>Scan Resume</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* BENTO 5: ACTIVE JOB DRIVES (Col Span 4) */}
              <div
                onClick={() => {
                  trackEvent("jobs_page_clicked");
                  safeTrack("dashboard_jobs_clicked", {});
                  navigate("/jobs");
                }}
                className="md:col-span-4 relative overflow-hidden bg-surface border border-border hover:border-primary/50 p-5 rounded-2xl shadow-subtle hover:shadow-card cursor-pointer transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent-soft text-accent border border-accent/20">
                      HIRING NOW
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">
                    Active Job Openings
                  </h3>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Curated tech hiring drives, off-campus opportunities & internships for students.
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-2 text-text-muted border border-border">
                      Freshers
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface-2 text-text-muted border border-border">
                      0-2 Yrs Exp
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-primary font-semibold">
                  <span>View Openings</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

            {/*  POTD SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
              <div className="h-full"><CpotdCard onClick={() => navigate("/coding-potd")} /></div>
              <div className="h-full"><PotdCard onClick={() => navigate("/potd")} /></div>
              <div className="h-full"><StreakCalendar /></div>
            </div>

            {/* ======================================================
                FEATURE 1 — WEEKLY INSIGHT CARD (Premium AI) 
               ====================================================== */}
            <div className="bg-surface border border-border p-6 rounded-xl shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-primary font-bold text-sm">
                      ✨
                    </span>
                    AI Learning Insight
                  </h3>
                  <p className="text-xs text-text-muted mt-1">
                    Weekly progress breakdown
                  </p>
                </div>

                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-soft text-primary border border-primary/20">
                  📊 This Week
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-text-muted">
                    • Score improvement
                  </div>
                  <div className={`text-2xl font-bold ${thisWeekColorClass} transition-colors`}>
                    {scoreImprovementPct === null
                      ? "+0%"
                      : `${scoreImprovementPct >= 0 ? "+" : ""}${scoreImprovementPct}%`}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-text-muted">
                    • Total learning time change
                  </div>
                  <div className={`text-2xl font-bold ${timeColorClass} transition-colors`}>
                    {timeDeltaMinutes === null
                      ? "+0 minutes"
                      : `${timeDeltaMinutes >= 0 ? "+" : ""}${timeDeltaMinutes} minutes`}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-text-muted">
                    • Best performing day
                  </div>
                  <div className="text-2xl font-bold text-text">{bestDay}</div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="text-sm font-medium text-text-muted">
                    • Short AI summary
                  </div>
                  <div className="text-sm text-text leading-relaxed">
                    "{insightMessage}"
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================
                WEEKLY PERFORMANCE CHART
               ====================================================== */}
            <div className="bg-surface border border-border p-6 rounded-xl shadow-subtle hover:border-primary/40 transition-colors">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-text flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary" /> Weekly Performance
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">Score & Time (last 7 days)</p>
                </div>

                <div
                  className={`font-semibold text-xs px-2.5 py-1 rounded-full ${
                    percentChange === null
                      ? "bg-primary-soft text-primary"
                      : percentChange >= 0
                        ? "bg-primary-soft text-primary"
                        : "bg-danger-soft text-danger"
                  }`}
                >
                  {percentChange === null
                    ? "New Activity"
                    : `${percentChange >= 0 ? "+" : ""}${percentChange}%`}
                </div>
              </div>

              {/* CHART */}
              <div className="w-full h-62.5 sm:h-75 md:h-87.5 min-h-62.5">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  className="bg-transparent rounded-xl"
                >
                  <LineChart data={weeklyData}>
                    <XAxis dataKey="date" stroke="var(--color-text-subtle, #98A2B3)" />

                    {/*  IMPORTANT: separate scales */}
                    <YAxis yAxisId="left" domain={[0, 10]} stroke="var(--color-text-subtle, #98A2B3)" />
                    <YAxis yAxisId="right" orientation="right" stroke="var(--color-text-subtle, #98A2B3)" />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-surface, #101A17)",
                        borderColor: "var(--color-border, #24342E)",
                        borderRadius: "8px",
                        color: "var(--color-text, #F2F4F7)",
                      }}
                      formatter={(value) => Number(value).toFixed(2)}
                    />

                    {/*  AVG SCORE */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgScore"
                      stroke="#059669"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Avg Score"
                    />

                    {/*  TIME SPENT */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="timeSpent"
                      stroke="#F59E0B"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Time (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 📰 TECH INTELLIGENCE FEED */}
            <div className="rounded-xl border border-border bg-surface shadow-subtle p-6 transition-colors">
              {/* HEADER */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-lg shrink-0">
                      📰
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-text">
                        Tech Intelligence Feed
                      </h3>

                      <p className="text-xs text-text-muted mt-0.5">
                        Latest news • Auto-refreshed every 4h
                      </p>
                    </div>
                  </div>
                </div>

                {/* BADGES */}
                {statsLoading ? (
                  <div className="flex gap-2">
                    <div className="w-20 h-7 rounded-md bg-surface-2 animate-pulse" />
                    <div className="w-24 h-7 rounded-md bg-surface-2 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary-soft text-primary font-medium text-xs border-0 px-2.5 py-1 rounded-md">
                      AI: {stats?.AI || 0}
                    </Badge>

                    <Badge className="bg-danger-soft text-danger font-medium text-xs border-0 px-2.5 py-1 rounded-md">
                      Layoffs: {stats?.Layoff?.weeklyLayoffs || 0}W
                    </Badge>
                  </div>
                )}
              </div>

              {/* FILTERS */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["all", "AI", "Layoff", "Hiring"].map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    onClick={() => setActiveFilter(t)}
                    className={`rounded-lg px-3.5 text-xs font-medium transition-colors ${
                      activeFilter === t
                        ? "bg-primary text-on-primary shadow-soft"
                        : "bg-surface-2 text-text-muted hover:text-text border border-border"
                    }`}
                  >
                    {t === "all" ? "All" : t}

                    {newsLoading && activeFilter === t && (
                      <Loader2 className="w-3.5 h-3.5 ml-1 animate-spin" />
                    )}
                  </Button>
                ))}
              </div>

              {/* LOADING */}
              {newsLoading ? (
                <div className="flex gap-4 animate-pulse overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <Card
                      key={i}
                      className="basis-80 h-56 rounded-xl bg-surface-2 border border-border"
                    />
                  ))}
                </div>
              ) : news?.length === 0 ? (
                /* EMPTY */
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-10 w-10 text-text-muted mb-3" />

                  <h4 className="text-base font-semibold text-text">
                    No news available
                  </h4>

                  <p className="text-xs text-text-muted mt-1 mb-4">
                    Try refreshing to fetch latest updates
                  </p>

                  <Button
                    onClick={() =>
                      dispatch(
                        fetchNews({
                          tag: activeFilter === "all" ? undefined : activeFilter,
                          limit: 50,
                        })
                      )
                    }
                    className="bg-primary hover:bg-primary-hover text-on-primary rounded-lg text-xs font-semibold px-4 h-9 shadow-soft"
                  >
                    Refresh
                  </Button>
                </div>
              ) : (
                <>
                  {/* NEWS CAROUSEL */}
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                      dragFree: true,
                    }}
                    plugins={plugin ? [plugin] : []}
                    className="[&_.embla__container]:gap-4"
                  >
                    <CarouselContent className="-ml-2">
                      {news?.map((article, index) => (
                        <CarouselItem key={index} className="basis-[300px] md:basis-[360px] pl-2">
                          <a
                            onClick={() =>
                              safeTrack("news_article_clicked", {
                                tag: article.tag,
                                company: article.company,
                              })
                            }
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group h-full"
                          >
                            <Card className="relative h-full rounded-xl border border-border bg-surface hover:border-primary/40 p-5 shadow-subtle transition-colors overflow-hidden">
                              {/* TAG */}
                              <span
                                className={`absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-md ${
                                  article.tag === "AI"
                                    ? "bg-primary-soft text-primary"
                                    : article.tag === "Layoff"
                                      ? "bg-danger-soft text-danger"
                                      : article.tag === "Hiring"
                                        ? "bg-success-soft text-success"
                                        : "bg-surface-2 text-text-muted"
                                }`}
                              >
                                {article.tag}
                              </span>

                              {/* CONTENT */}
                              <div className="relative space-y-3">
                                <h4 className="font-bold text-base leading-snug line-clamp-2 text-text group-hover:text-primary transition-colors">
                                  {article.title}
                                </h4>

                                <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">
                                  {article.summary}
                                </p>

                                <div className="pt-3 border-t border-border flex items-center justify-between">
                                  <div className="text-[11px] text-text-muted space-y-0.5">
                                    {article.company !== "Various" && (
                                      <p className="font-semibold text-text">
                                        {article.company}
                                      </p>
                                    )}

                                    <p>
                                      {new Date(article.publishedAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                      })}
                                    </p>
                                  </div>

                                  <div className="h-8 w-8 rounded-lg bg-surface-2 text-text-muted flex items-center justify-center group-hover:text-primary group-hover:bg-primary-soft transition-colors">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </a>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </>
              )}

              {/* ERROR */}
              {newsError && <p className="text-center text-xs text-danger mt-4">{newsError}</p>}
            </div>

            <div>
              {/* COMPANIES */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-text">
                    Recommended{" "}
                    <span className="text-primary ml-1">
                      Companies
                    </span>
                  </h3>

                  <p className="text-xs text-text-muted mt-0.5">
                    Explore top companies & prepare for your dream job
                  </p>
                </div>

                <Badge className="w-fit bg-primary text-on-primary border-0 px-2.5 py-1 rounded-md text-xs font-semibold shadow-soft">
                  Top Hiring
                </Badge>
              </div>

              <div className="space-y-4 overflow-hidden">
                {/* 🔵 ROW 1 (Left → Right) */}
                <div className="flex gap-4 animate-scroll-left">
                  {[...companies, ...companies].map((company, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        safeTrack("company_clicked", {
                          company: company.name,
                        });

                        navigate(`/company/${company.name.toLowerCase()}`);
                      }}
                      className="min-w-[300px] cursor-pointer"
                    >
                      <Card className="group border border-border bg-surface rounded-xl shadow-soft hover:shadow-subtle hover:border-primary/40 transition-colors overflow-hidden">
                        <CardContent className="relative p-4 flex items-center justify-between">
                          {/* LEFT */}
                          <div className="flex items-center gap-3.5">
                            {/* LOGO */}
                            <div className="h-12 w-12 rounded-xl bg-surface-2 border border-border p-2 flex items-center justify-center shadow-subtle shrink-0">
                              <img
                                src={company.logo}
                                alt={company.name}
                                className="h-full w-full object-contain"
                              />
                            </div>

                            {/* TEXT */}
                            <div>
                              <h3 className="font-bold text-sm text-text">
                                {company.name}
                              </h3>

                              <p className="text-xs text-text-muted">
                                {company.role}
                              </p>

                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-accent text-xs">⭐</span>

                                <span className="text-xs font-semibold text-text">
                                  {company.rating}
                                </span>

                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary-soft text-primary font-medium">
                                  Hiring
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="h-8 w-8 rounded-lg bg-surface-2 text-text-muted flex items-center justify-center group-hover:text-primary group-hover:bg-primary-soft transition-colors shrink-0">
                            <ExternalLink className="h-4 w-4" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* 🔴 ROW 2 (Right → Left) */}
                <div className="flex gap-5 animate-scroll-right">
                  {[...companies, ...companies].map((company, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        safeTrack("company_clicked", {
                          company: company.name,
                        });

                        navigate(`/company/${company.name.toLowerCase()}`);
                      }}
                      className="min-w-[330px] cursor-pointer"
                    >
                      <Card className="group border border-border bg-surface rounded-xl shadow-soft hover:shadow-subtle hover:border-primary/40 transition-all duration-200 overflow-hidden">
                        <CardContent className="relative p-5 flex items-center justify-between">
                          {/* LEFT */}
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-surface-2 border border-border p-2.5 flex items-center justify-center">
                              <img
                                src={company.logo}
                                alt={company.name}
                                className="h-full w-full object-contain"
                              />
                            </div>

                            <div>
                              <h3 className="font-semibold text-base text-text">
                                {company.name}
                              </h3>

                              <p className="text-xs text-text-muted">
                                {company.role}
                              </p>

                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-accent text-xs">⭐</span>

                                <span className="text-xs font-medium text-text-muted">
                                  {company.rating}
                                </span>

                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-soft text-accent font-medium">
                                  Popular
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="h-9 w-9 rounded-lg bg-surface-2 flex items-center justify-center group-hover:bg-primary-soft transition-colors">
                            <ExternalLink className="h-4 w-4 text-text-subtle group-hover:text-primary transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </main>
        <ContactUs />
        <SuccessStories />
      </div>

      <Footer />
    </>
  );
}
