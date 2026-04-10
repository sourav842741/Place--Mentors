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

import { Play, Briefcase, TrendingUp,Building2, Globe, Cpu, Code,ExternalLink,ArrowRight} from "lucide-react";
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



export default function Dashboard() {
  const { user } = useSelector((state) => state.user);
  console.log("🔥 USER FRONTEND:", user);

  const navigate = useNavigate();

  const [weeklyData, setWeeklyData] = React.useState([]);



  const [unlockedBadges, setUnlockedBadges] = React.useState([]);

 
  const streak = user?.streakCount || 0;


  const totalXP = user?.xp || 0;

  //  XP required for current level
const xp = user?.xp || 0;
const level = user?.level || 1;

const prevXP = ((level - 1) * level * 100) / 2;
const currentXP = xp - prevXP;
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
    logo: "https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
  },
  {
    name: "Microsoft",
    role: "Cloud Architect",
    rating: "4.7",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
  },
  {
    name: "Amazon",
    role: "SDE-II",
    rating: "4.5",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
  },
  {
    name: "Apple",
    role: "iOS Developer",
    rating: "4.9",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
  },
  {
    name: "Meta",
    role: "Product Manager",
    rating: "4.6",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
  },
  {
    name: "Netflix",
    role: "UI/UX Designer",
    rating: "4.7",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
  },
  {
    name: "Tesla",
    role: "Hardware Engineer",
    rating: "4.3",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg"
  },
  {
    name: "Spotify",
    role: "Data Scientist",
    rating: "4.8",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
  },
  {
    name: "Adobe",
    role: "Product Designer",
    rating: "4.6",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Adobe_Inc._logo_2020.svg"
  },
  {
    name: "LinkedIn",
    role: "Full Stack Developer",
    rating: "4.5",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
  },
  {
    name: "Uber",
    role: "Backend Engineer",
    rating: "4.4",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
  },
  {
    name: "Airbnb",
    role: "Frontend Engineer",
    rating: "4.7",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Belo.svg"
  },
  {
    name: "NVIDIA",
    role: "AI Researcher",
    rating: "4.9",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg"
  },
  {
    name: "Slack",
    role: "DevOps Engineer",
    rating: "4.6",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg"
  },
  {
    name: "PayPal",
    role: "Fintech Analyst",
    rating: "4.4",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
  }
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

  const currentAvg = Number(
  (
    weeklyData.reduce((sum, d) => sum + Number(d.avgScore), 0) /
    weeklyData.length
  ).toFixed(2)
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
              <div className="md:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all cursor-default">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.fullName} 👋
                </h1>

                <p className="mt-2 text-lg text-gray-500 font-medium">Level {level} 🚀</p>

                <p className="text-lg text-gray-600 font-medium mt-1">
                  ⏱ Today: {weeklyData?.[weeklyData.length - 1]?.timeSpent || 0}{" "}
                  min
                </p>

                <button className="mt-6 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 font-semibold shadow-sm hover:shadow-md transition-all">
                  Continue Learning →
                </button>
              </div>

              {/* XP */}
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Progress</p>

                <h2 className="text-3xl font-bold text-gray-900">
                  {currentXP} / {maxXP} XP
                </h2>

                <div className="w-full bg-gray-200 rounded-full h-3 mt-4 shadow-inner">
                  <div
                    className="bg-black h-3 rounded-full shadow-md transition-all duration-1000 ease-out"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* ACTION */}
            <div className="grid md:grid-cols-2 gap-6">
              <div
                onClick={() => navigate("/quiz")}
                className="flex items-center justify-between bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-black/50 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl shadow-sm">
                    <Play className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Practice</h3>
                    <p className="text-gray-500 font-medium">Daily quiz challenges</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>

              <div
                onClick={() => navigate("/jobs")}
                className="flex items-center justify-between bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-black/50 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl shadow-sm">
                    <Briefcase className="w-6 h-6 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Jobs</h3>
                    <p className="text-gray-500 font-medium">Latest openings</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 🔥 POTD SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CpotdCard 
                solved={user?.codingPotdCompleted || false} 
                onClick={() => navigate("/coding-potd")}
              />
              <PotdCard 
                solved={user?.potdCompleted || false} 
                onClick={() => navigate("/potd")}
              />
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              {/* HEADER */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp size={20} className="text-gray-900" /> Weekly Performance
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Score & Time (last 7 days)
                  </p>
                </div>

                <div className={`font-semibold text-sm px-3 py-1 rounded-full ${percentChange === null ? 'bg-green-100 text-green-700' : percentChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {percentChange === null
                    ? "New Activity 🚀"
                    : `${percentChange >= 0 ? "+" : ""}${percentChange}%`}
                </div>
              </div>

              {/* CHART */}
              <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
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

           
            <div>

               {/* COMPANIES */}
  <h3 className="font-semibold mb-4">Recommended Companies</h3>

 <div className="space-y-4 overflow-hidden">

  {/* 🔵 ROW 1 (Left → Right) */}
  <div className="flex gap-4 animate-scroll-left">
    {[...companies, ...companies].map((company, index) => (
      <div
        key={index}
        onClick={() => navigate(`/company/${company.name.toLowerCase()}`)}
        className="min-w-[180px] cursor-pointer"
      >
        <Card
  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-black/50 transition-all cursor-pointer"
  onClick={() => navigate(`/company/${company.name.toLowerCase()}`)}
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
      <h3 className="font-semibold text-gray-900">{company.name}</h3>
      
      <p className="text-sm text-gray-500">
        {company.role}
      </p>

      {/* Rating */}
      <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
        ⭐ <span className="text-gray-700">{company.rating}</span>
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
      onClick={() => navigate(`/company/${company.name.toLowerCase()}`)}
      className="min-w-[280px] cursor-pointer"
    >
      <Card
        className="flex items-center justify-between p-4 rounded-xl shadow-sm hover:shadow-md transition"
      >
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <img
            src={company.logo}
            alt={company.name}
            className="h-12 w-12 rounded-lg object-contain bg-gray-100 p-2"
          />

          {/* TEXT */}
          <div>
            <h3 className="font-semibold text-gray-900">{company.name}</h3>

            <p className="text-sm text-gray-500">
              {company.role}
            </p>

            <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
              ⭐ <span className="text-gray-700">{company.rating}</span>
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
      </div>
      <SuccessStories/>
      <Footer/>
    </>
  );
}
