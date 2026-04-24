import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../hooks/useAnalytics";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Play,
  Briefcase,
  TrendingUp,
  Building2,
  Globe,
  Cpu,
  Code,
  ExternalLink,
  ArrowRight,
  Loader2,
  Mic,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import api from "../services/api";
import Footer from "@/components/Footer";
import SuccessStories from "@/components/SuccessStories";
import PotdCard from "@/components/PotdCard";
import CpotdCard from "@/components/CpotdCard";

import { fetchNews, fetchNewsStats } from "../redux/newsSlice.js";
import { Button } from "@/components/ui/button.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import ContactUs from "@/components/ContactUs";
import StreakCalendar from "@/components/StreakCalendar.jsx";
import { fetchStreak } from "../redux/streakSlice.js";

import AnnouncementBar from "../components/AnnouncementBar";
import useSettings from "../hooks/useSettings";
import { useQueryClient } from "@tanstack/react-query";

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
      } catch (err) {}
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
      } catch (err) {
        console.error("Motivation fetch error:", err);
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
      }),
    );
  }, [dispatch, activeFilter]);

  const calculateWeeklyChange = () => {
    if (!weeklyData || weeklyData.length === 0) return 0;

    const currentAvg = Number(
      (
        weeklyData.reduce((sum, d) => sum + Number(d.avgScore), 0) /
        weeklyData.length
      ).toFixed(2),
    );

    const previousAvg =
      weeklyData
        .slice(0, weeklyData.length - 1)
        .reduce((sum, d) => sum + d.avgScore, 0) / (weeklyData.length - 1 || 1);

    //  FIX HERE
    if (previousAvg === 0) {
      return null; // special case
    }

    return Math.round(((currentAvg - previousAvg) / previousAvg) * 100);
  };

  const percentChange = calculateWeeklyChange();

  const today = new Date().toISOString().split("T")[0];

  const todayData =
    weeklyData.find((d) => d.date === today) ||
    weeklyData[weeklyData.length - 1] ||
    {};
  // ======================================================

  return (
    <>
      <Navbar />
      {settings?.data && (
        <div className="mt-16 lg:ml-64">
          <AnnouncementBar settings={settings.data} />
        </div>
      )}

      <div className="lg:pl-64 p-4 md:p-6 bg-gray-100 min-h-screen dark:bg-gray-950 transition-colors duration-300">
        {/* 🔥 BADGE POPUP */}
        {unlockedBadges.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-3xl p-8 text-center animate-scaleUp shadow-2xl max-w-md mx-4  dark:bg-gray-900 ">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                🎉 New Badge Unlocked!
              </h2>
              {unlockedBadges.map((badge, i) => (
                <div key={i} className="text-lg font-semibold mb-2">
                  {badge.name}
                </div>
              ))}
              <button
                onClick={() => setUnlockedBadges([])}
                className="mt-4 bg-green-500 text-white px-6 py-2 rounded-xl"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}

        <main className="flex-1">
          <div className="p-2 md:p-6 space-y-4 md:space-y-6">
            {/* TOP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all cursor-default  dark:bg-gray-900  dark:border-white/10">
                <h1 className="text-3xl font-bold  text-gray-900 dark:text-white">
                  Welcome back, {user?.fullName} 👋
                </h1>

                <p className="mt-2 text-lg  text-gray-500 dark:text-gray-400 font-medium">
                  Level {level} 🚀
                </p>

                <p className="text-lg  text-gray-600 dark:text-gray-400 font-medium mt-1">
                  ⏱ Today: {todayData?.timeSpent || 0} min
                </p>

                <button className="mt-6 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 font-semibold shadow-sm hover:shadow-md transition-all">
                  Continue Learning →
                </button>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all  dark:bg-gray-900  dark:border-white/10">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                  Progress
                </p>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentXP} / {maxXP} XP
                </h2>

                {/* Progress Bar */}
                <div className="w-full  bg-gray-100 dark:bg-gray-800 rounded-full h-3 mt-4 overflow-hidden ">
                  <div
                    className="bg-linear-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>

                {/*  MOTIVATION INSIDE */}
                <div className="mt-4">
                  {loadingMotivation ? (
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
                  ) : (
                    <p className="text-sm md:text-base font-medium text-gray-600 leading-relaxed whitespace-pre-line dark:text-white">
                      {motivation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ACTION */}
            <div className="grid md:grid-cols-2 gap-6">
              <div
                onClick={() => navigate("/quiz")}
                className="flex items-center justify-between bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-black/50 cursor-pointer transition-all duration-200  dark:bg-gray-900  dark:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3  bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
                    <Play className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Practice
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Daily quiz challenges
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>

              <div
                onClick={() => {
                  trackEvent("jobs_page_clicked");
                  navigate("/jobs");
                }}
                className="flex items-center justify-between bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-black/50 cursor-pointer transition-all duration-200  dark:bg-gray-900  dark:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3  bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
                    <Briefcase className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Jobs
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Latest openings
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            <div
              onClick={() => navigate("/ai-voice-coach")}
              className="relative overflow-hidden flex items-center justify-between
  bg-white dark:bg-gray-900
  border border-gray-200 dark:border-white/10
  p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500
  cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/10 opacity-0 group-hover:opacity-100 transition duration-300"></div>

              <div className="flex items-center gap-5 relative z-10">
                {/* Icon */}
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl shadow-sm">
                  <Mic className="w-7 h-7 text-blue-600 dark:text-blue-400 animate-pulse" />
                </div>

                {/* Text */}
                <div className="ml-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    🎤 AI Voice Interview
                  </h3>

                  <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                    Speak live with AI & boost confidence instantly
                  </p>

                  <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold bg-yellow-400 text-black rounded-full shadow">
                    🔥 Most Popular Feature
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-2 transition-all relative z-10" />
            </div>

            {/* NEW PLACEMENT PREDICTOR PREMIUM CARD */}
            <div
              onClick={() => navigate("/placement-predictor")}
              className="relative overflow-hidden flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-purple-500 cursor-pointer transition-all duration-300 hover:scale-[1.02] group"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-purple-50 dark:bg-purple-900/10 opacity-0 group-hover:opacity-100 transition duration-300 rounded-2xl"></div>

              <div className="flex items-center gap-5 relative z-10">
                {/* Icon */}
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl shadow-sm group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-all">
                  <TrendingUp className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Placement Predictor AI
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-lg mb-3">
                    Check your placement chances in 30 seconds
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-xs px-3 py-1 font-semibold shadow-sm">
                      AI Powered
                    </Badge>
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-xs px-4 py-1 font-semibold shadow-sm">
                      Salary Prediction
                    </Badge>
                  </div>
                </div>
              </div>

              {/* CTA Arrow */}
              <div className="hidden sm:block text-right relative z-10">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                  Predict Now
                </div>

                <ArrowRight className="w-7 h-7 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-2 transition-all ml-auto" />
              </div>
            </div>

 <div
  onClick={() => navigate("/interview-experience")}
  className="relative overflow-hidden flex items-center justify-between
  bg-white dark:bg-gray-900
  border border-gray-200 dark:border-white/10
  p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-500
  cursor-pointer transition-all duration-300 hover:scale-[1.02] group min-h-[170px]"
>
  {/* Hover Glow */}
  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 bg-blue-50 dark:bg-blue-900/10"></div>

  {/* Left */}
  <div className="relative z-10 flex items-center gap-5 flex-1">

    {/* Icon */}
    <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 shadow-sm shrink-0">
      <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
    </div>

    {/* Text */}
    <div className="flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Interview Experience
        </h3>

        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-600 text-white shadow">
          NEW
        </span>
      </div>

      <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 text-base md:text-lg">
        Real company rounds, HR questions & student success stories
      </p>

      {/* Tags */}
      <div className="flex gap-2 mt-4 flex-wrap">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          TCS
        </span>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
          Infosys
        </span>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
          Wipro
        </span>
      </div>
    </div>
  </div>

  {/* Right */}
  <div className="hidden md:flex flex-col items-end justify-center relative z-10 ml-6">
    <span className="text-purple-600 dark:text-purple-400 font-bold text-2xl">
      Explore Now
    </span>

    <ArrowRight className="w-8 h-8 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-2 transition-all mt-3" />
  </div>
</div>

            {/*  POTD SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <CpotdCard onClick={() => navigate("/coding-potd")} />
              <PotdCard onClick={() => navigate("/potd")} />
              <StreakCalendar />
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all  dark:bg-gray-900  dark:border-white/10">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp size={20} className="text-gray-900" /> Weekly
                    Performance
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Score & Time (last 7 days)
                  </p>
                </div>

                <div
                  className={`font-semibold text-sm px-3 py-1 rounded-full ${percentChange === null ? "bg-green-100 text-green-700" : percentChange >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {percentChange === null
                    ? "New Activity "
                    : `${percentChange >= 0 ? "+" : ""}${percentChange}%`}
                </div>
              </div>

              {/* CHART */}
              <div className="w-full h-62.5 sm:h-75 md:h-87.5 min-h-62.5">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  className="bg-white dark:bg-gray-900 rounded-xl"
                >
                  <LineChart data={weeklyData}>
                    <XAxis dataKey="date" />

                    {/*  IMPORTANT: separate scales */}
                    <YAxis yAxisId="left" domain={[0, 10]} />
                    <YAxis yAxisId="right" orientation="right" />

                    <Tooltip formatter={(value) => Number(value).toFixed(2)} />

                    {/*  AVG SCORE */}
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="avgScore"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Avg Score"
                    />

                    {/*  TIME SPENT */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="timeSpent"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Time (min)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 📰 TECH INTELLIGENCE FEED */}
            <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm p-6 md:p-8 transition-all duration-300">
              {/* HEADER */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-7">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl  flex items-center justify-center text-white shadow-md">
                      📰
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Tech Intelligence Feed
                      </h3>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Latest news • Auto-refreshed every 4h
                      </p>
                    </div>
                  </div>
                </div>

                {/* BADGES */}
                {statsLoading ? (
                  <div className="flex gap-2">
                    <div className="w-20 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="w-24 h-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-3 py-1">
                      AI: {stats?.AI || 0}
                    </Badge>

                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 px-3 py-1">
                      Layoffs: {stats?.Layoff?.weeklyLayoffs || 0}W
                    </Badge>
                  </div>
                )}
              </div>

              {/* FILTERS */}
              <div className="flex flex-wrap gap-2 mb-7">
                {["all", "AI", "Layoff", "Hiring"].map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    onClick={() => setActiveFilter(t)}
                    className={`rounded-full px-4 text-xs font-semibold transition-all duration-300 ${
                      activeFilter === t
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    {t === "all" ? "All" : t}

                    {newsLoading && activeFilter === t && (
                      <Loader2 className="w-4 h-4 ml-1 animate-spin" />
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
                      className="basis-80 h-64 rounded-3xl bg-gray-200 dark:bg-gray-800 border-0"
                    />
                  ))}
                </div>
              ) : news?.length === 0 ? (
                /* EMPTY */
                <div className="text-center py-14">
                  <TrendingUp className="mx-auto h-14 w-14 text-gray-400 mb-4" />

                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    No news available
                  </h4>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-5">
                    Try refreshing to fetch latest updates
                  </p>

                  <Button
                    onClick={() =>
                      dispatch(
                        fetchNews({
                          tag:
                            activeFilter === "all" ? undefined : activeFilter,
                          limit: 50,
                        }),
                      )
                    }
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-5"
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
                        <CarouselItem
                          key={index}
                          className="basis-[320px] md:basis-[380px] pl-2"
                        >
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group h-full"
                          >
                            <Card className="relative h-full rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                              {/* TOP GLOW */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-blue-50 dark:bg-blue-500/5" />

                              {/* TAG */}
                              <Badge
                                className={`absolute top-4 right-4 text-white border-0 text-xs px-3 py-1 ${
                                  article.tag === "AI"
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                    : article.tag === "Layoff"
                                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                                      : article.tag === "Hiring"
                                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                        : "bg-gradient-to-r from-blue-500 to-indigo-500"
                                }`}
                              >
                                {article.tag}
                              </Badge>

                              {/* CONTENT */}
                              <div className="relative space-y-4">
                                <h4 className="font-bold text-lg leading-tight line-clamp-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {article.title}
                                </h4>

                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                  {article.summary}
                                </p>

                                <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                    {article.company !== "Various" && (
                                      <p className="font-semibold text-gray-900 dark:text-white">
                                        {article.company}
                                      </p>
                                    )}

                                    <p>
                                      {new Date(
                                        article.publishedAt,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                      })}
                                    </p>
                                  </div>

                                  <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10 transition">
                                    <ExternalLink className="h-4 w-4 text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
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
              {newsError && (
                <p className="text-center text-sm text-red-500 mt-5">
                  {newsError}
                </p>
              )}
            </div>

            <div>
              {/* COMPANIES */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Recommended{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Companies
                    </span>
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Explore top companies & prepare for your dream job
                  </p>
                </div>

                <Badge className="w-fit bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1 rounded-full shadow-sm">
                  Top Hiring
                </Badge>
              </div>

              <div className="space-y-5 overflow-hidden">
                {/* 🔵 ROW 1 (Left → Right) */}
                <div className="flex gap-5 animate-scroll-left">
                  {[...companies, ...companies].map((company, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        navigate(`/company/${company.name.toLowerCase()}`)
                      }
                      className="min-w-[330px] cursor-pointer"
                    >
                      <Card className="group border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-blue-50 dark:bg-blue-500/5 opacity-0 group-hover:opacity-100 transition duration-300"></div>

                        <CardContent className="relative p-5 flex items-center justify-between">
                          {/* LEFT */}
                          <div className="flex items-center gap-4">
                            {/* LOGO */}
                            <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 p-3 flex items-center justify-center shadow-sm">
                              <img
                                src={company.logo}
                                alt={company.name}
                                className="h-full w-full object-contain"
                              />
                            </div>

                            {/* TEXT */}
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {company.name}
                              </h3>

                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {company.role}
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-yellow-500">⭐</span>

                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {company.rating}
                                </span>

                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                                  Hiring
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-500/10 transition">
                            <ExternalLink className="h-5 w-5 text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
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
                      onClick={() =>
                        navigate(`/company/${company.name.toLowerCase()}`)
                      }
                      className="min-w-[330px] cursor-pointer"
                    >
                      <Card className="group border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-purple-50 dark:bg-purple-500/5 opacity-0 group-hover:opacity-100 transition duration-300"></div>

                        <CardContent className="relative p-5 flex items-center justify-between">
                          {/* LEFT */}
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 p-3 flex items-center justify-center shadow-sm">
                              <img
                                src={company.logo}
                                alt={company.name}
                                className="h-full w-full object-contain"
                              />
                            </div>

                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {company.name}
                              </h3>

                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {company.role}
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-yellow-500">⭐</span>

                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {company.rating}
                                </span>

                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                                  Popular
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT */}
                          <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-500/10 transition">
                            <ExternalLink className="h-5 w-5 text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
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
