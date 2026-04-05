import { useSelector } from "react-redux";
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

import { Play, Briefcase, TrendingUp,Building2, Globe, Cpu, Code} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import api from "../services/api";


export default function Dashboard() {
  const { user } = useSelector((state) => state.user);

  const navigate = useNavigate();

  const [weeklyData, setWeeklyData] = React.useState([]);

  const { updateTimeSpent } = useAuth();

  const [unlockedBadges, setUnlockedBadges] = React.useState([]);

  const xp = user?.xp || 0;
  const streak = user?.streakCount || 0;

  const level = user?.level || 1;
  const totalXP = user?.xp || 0;

  //  XP required for current level
  const maxXP = level * 100;

  //  total XP till previous levels (correct formula)
  const prevXP = ((level - 1) * level * 100) / 2;

  //  current progress
  const currentXP = totalXP - prevXP;

  const percent = (currentXP / maxXP) * 100;

 const companies = [
  { name: "Google", icon: <Globe className="text-blue-500 w-5 h-5" /> },
  { name: "Amazon", icon: <Briefcase className="text-yellow-500 w-5 h-5" /> },
  { name: "Microsoft", icon: <Cpu className="text-green-500 w-5 h-5" /> },
  { name: "Meta", icon: <Code className="text-blue-400 w-5 h-5" /> },
  { name: "Netflix", icon: <Building2 className="text-red-500 w-5 h-5" /> },
];

  const plugin = React.useRef(
    Autoplay({ delay: 1500, stopOnInteraction: false }),
  );

  const playSound = () => {
    const audio = new Audio("/sounds/badge.mp3");
    audio.play();
  };

  // ================= FIXED TIME TRACK =================
  React.useEffect(() => {
    let interval;

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        interval = setInterval(async () => {
          try {
            await api.post("/api/xp/time", { minutes: 1 });

            const res = await api.get("/api/dashboard/weekly", {
              withCredentials: true,
            });

            const formatted = (res.data?.weeklyData || []).map((item) => ({
              ...item,
              date: new Date(item.date).toLocaleDateString("en-US", {
                weekday: "short",
              }),
            }));

            setWeeklyData(formatted);
          } catch (err) {
            console.log("Time sync error");
          }
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
          date: new Date(item.date).toLocaleDateString("en-US", {
            weekday: "short",
          }),
        }));

        setWeeklyData(formatted);
      } catch (err) {
        console.log(err);
      }
    };

    fetchWeekly();
  }, []);

  const calculateWeeklyChange = () => {
    if (!weeklyData || weeklyData.length === 0) return 0;

    const currentAvg =
      weeklyData.reduce((sum, d) => sum + d.avgScore, 0) / weeklyData.length;

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
  // ======================================================

  return (
    <>
      <Navbar />
      <div className="pt-16 md:pl-64 p-4 md:p-6 bg-gray-100 min-h-screen mt-16">
        {/* 🔥 BADGE POPUP */}
        {unlockedBadges.length > 0 && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-3xl p-8 text-center animate-scaleUp shadow-2xl max-w-md mx-4">
              <h2 className="text-2xl font-bold mb-4">
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
              <div className="md:col-span-2 bg-linear-to-r from-blue-500 to-purple-500 text-white p-6 rounded-2xl shadow">
                <h1 className="text-2xl font-bold">
                  Welcome back, {user?.fullName} 👋
                </h1>

                <p className="mt-2 text-sm opacity-90">Level {level} 🚀</p>

                <p className="text-sm mt-1">
                  ⏱ Today: {weeklyData?.[weeklyData.length - 1]?.timeSpent || 0}{" "}
                  min
                </p>

                <button className="mt-4 bg-white text-black px-4 py-2 rounded-lg">
                  Resume →
                </button>
              </div>

              {/* XP */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl">
                <p className="text-sm text-gray-500">Progress</p>

                <h2 className="text-3xl font-bold text-blue-600">
                  {currentXP} / {maxXP} XP
                </h2>

                <div className="w-full bg-gray-300 rounded-full h-2 mt-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* ACTION */}
            <div className="grid md:grid-cols-2 gap-6">
              <div
                onClick={() => navigate("/quiz")}
                className="flex items-center justify-between bg-white dark:bg-gray-900 p-5 rounded-xl shadow cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <div className="flex items-center gap-3">
                  <Play className="text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Practice</h3>
                    <p className="text-sm text-gray-500">Daily quiz</p>
                  </div>
                </div>
                →
              </div>

              <div
                onClick={() => navigate("/jobs")}
                className="flex items-center justify-between bg-white dark:bg-gray-900 p-5 rounded-xl shadow cursor-pointer hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="text-purple-500" />
                  <div>
                    <h3 className="font-semibold">Jobs</h3>
                    <p className="text-sm text-gray-500">Openings</p>
                  </div>
                </div>

                <span className="text-xl text-gray-400 group-hover:translate-x-1 transition">
                  →
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp size={18} /> Weekly Performance
                  </h3>
                  <p className="text-sm text-gray-500">
                    Score & Time (last 7 days)
                  </p>
                </div>

                <p className="font-semibold text-blue-400">
                  {percentChange === null
                    ? "New Activity 🚀"
                    : `${percentChange >= 0 ? "+" : ""}${percentChange}% this week`}
                </p>
              </div>

              {/* CHART */}
              <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <XAxis dataKey="date" />

                    {/*  IMPORTANT: separate scales */}
                    <YAxis yAxisId="left" domain={[0, 10]} />
                    <YAxis yAxisId="right" orientation="right" />

                    <Tooltip />

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

            {/* COMPANIES */}
            <div>
  <h3 className="font-semibold mb-4">Recommended Companies</h3>

  <Carousel
    plugins={[plugin.current]}
    opts={{ align: "start", loop: true }}
    className="w-full"
  >
    <CarouselContent>
      {companies.map((company, index) => (
        <CarouselItem
          key={index}
          className="basis-1/2 sm:basis-1/3 lg:basis-1/6"
        >
          <div className="p-2">
            <Card className="hover:scale-105 transition">
              <CardContent className="flex flex-col items-center justify-center h-24 gap-2">
                
                {/* Icon */}
                {company.icon}

                {/* Small Name */}
                <span className="text-sm font-medium text-gray-600">
                  {company.name}
                </span>

              </CardContent>
            </Card>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
  </Carousel>
</div>
          </div>
        </main>
      </div>
    </>
  );
}
