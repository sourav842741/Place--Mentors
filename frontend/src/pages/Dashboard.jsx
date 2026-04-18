import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";
import useAuth from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

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

export default function Dashboard() {
  const { user } = useSelector((state) => state.user);

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

const percent = Math.min(
  Math.max((currentXP / maxXP) * 100, 0),
  100
);

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
      <div className="pt-16 md:pl-64 p-4 md:p-6 bg-gray-100 min-h-screen mt-16  dark:bg-gray-950 transition-colors duration-300">
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
                onClick={() => navigate("/jobs")}
                className="flex items-center justify-between bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-black/50 cursor-pointer transition-all duration-200  dark:bg-gray-900  dark:border-white/10"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3  bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm">
                    <Briefcase className="w-6 h-6 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Jobs</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Latest openings</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/*  POTD SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CpotdCard
                onClick={() => navigate("/coding-potd")}
              />
              <PotdCard
                onClick={() => navigate("/potd")}
              />
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
               <ResponsiveContainer width="100%" height="100%" className="bg-white dark:bg-gray-900 rounded-xl">
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
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8  dark:bg-gray-900  dark:border-white/10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    📰 Tech Intelligence Feed
                  </h3>
                  <p className="text-gray-500">
                    Latest news • Auto-refreshed every 4h
                  </p>
                </div>

                {/* Stats Badges */}
                {statsLoading ? (
                  <div className="flex gap-2">
                    <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
                    <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      AI: {stats?.AI || 0}
                    </Badge>
                    <Badge variant="destructive" className="text-xs">
                      Layoffs: {stats?.Layoff?.weeklyLayoffs || 0}W
                    </Badge>
                  </div>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["all", "AI", "Layoff", "Hiring"].map((t) => (
                  <Button
                    key={t}
                    variant={activeFilter === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(t)}
                    className="text-xs"
                  >
                    {t === "all" ? "All" : t}
                    {newsLoading && activeFilter === t && (
                      <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                    )}
                  </Button>
                ))}
              </div>

              {newsLoading ? (
                <div className="flex animate-pulse space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card
                      key={i}
                      className="basis-80 h-64 bg-gray-200 rounded-2xl"
                    />
                  ))}
                </div>
              ) : news?.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">No news available</p>

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
                  >
                    Refresh
                  </Button>
                </div>
              ) : (
                <>
                  {/* News Carousel */}
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
                          className="basis-80 md:basis-96 pl-2"
                        >
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group"
                          >
                            <Card className="h-full p-6 hover:shadow-xl border-0 bg-linear-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 group-hover:from-blue-50 transition-all duration-300 shadow-sm hover:-translate-y-1">
                              {/* Tag Badge */}
                              <Badge
                                className={`absolute top-4 right-4 text-xs px-3 py-1 font-semibold ${
                                  article.tag === "AI"
                                    ? "bg-linear-to-r from-purple-500 to-pink-500"
                                    : article.tag === "Layoff"
                                      ? "bg-linear-to-r from-red-500 to-orange-500"
                                      : article.tag === "Hiring"
                                        ? "bg-green-500"
                                        : "bg-indigo-500"
                                }`}
                              >
                                {article.tag}
                              </Badge>

                              {/* Content */}
                              <div className="space-y-3">
                                <h4 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                                  {article.title}
                                </h4>

                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                  {article.summary}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t">
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    {article.company !== "Various" && (
                                      <span className="font-semibold text-gray-900 dark:text-white">
                                        {article.company}
                                      </span>
                                    )}
                                    <span>•</span>
                                    <span>
                                      {new Date(
                                        article.publishedAt,
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                      })}
                                    </span>
                                  </div>

                                  <ExternalLink className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition-colors" />
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
              {newsError && (
                <p className="text-center text-sm text-red-500 mt-4">
                  {newsError}
                </p>
              )}
            </div>

            <div>
              {/* COMPANIES */}
              <h3 className="font-semibold mb-4">Recommended Companies</h3>

              <div className="space-y-4 overflow-hidden">
                {/* 🔵 ROW 1 (Left → Right) */}
                <div className="flex gap-4 animate-scroll-left">
                  {[...companies, ...companies].map((company, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        navigate(`/company/${company.name.toLowerCase()}`)
                      }
                      className="min-w-45 cursor-pointer"
                    >
                      <Card
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-black/50 transition-all cursor-pointer"
                        onClick={() =>
                          navigate(`/company/${company.name.toLowerCase()}`)
                        }
                      >
                        {/* LEFT: Logo */}
                        <div className="flex items-center gap-4">
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-12 w-12 rounded-lg object-contain bg-gray-100 p-2"
                          />

                          {/* CENTER: Text */}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {company.name}
                            </h3>

                            <p className="text-sm text-gray-500">
                              {company.role}
                            </p>

                            {/* Rating */}
                            <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
                              ⭐{" "}
                              <span className="text-gray-700">
                                {company.rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT: Redirect Icon */}
                        <ExternalLink className="h-5 w-5 text-gray-400" />
                      </Card>
                    </div>
                  ))}
                </div>

                {/* 🔴 ROW 2 (Right → Left) */}
                <div className="flex gap-4 animate-scroll-right">
                  {[...companies, ...companies].map((company, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        navigate(`/company/${company.name.toLowerCase()}`)
                      }
                      className="min-w-70 cursor-pointer"
                    >
                      <Card className="flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md transition">
                        {/* LEFT */}
                        <div className="flex items-center gap-4">
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-12 w-12 rounded-lg object-contain bg-gray-100 p-2"
                          />

                          {/* TEXT */}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {company.name}
                            </h3>

                            <p className="text-sm text-gray-500">
                              {company.role}
                            </p>

                            <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
                              ⭐{" "}
                              <span className="text-gray-700">
                                {company.rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT ICON */}
                        <ExternalLink className="h-5 w-5 text-gray-400" />
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
         <ContactUs/>
        <SuccessStories />
       
      </div>

      <Footer />
    </>
  );
}