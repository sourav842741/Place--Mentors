import React, { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../services/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [myTime, setMyTime] = useState(0);

  const currentUser = useSelector((state) => state.user.user);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/api/leaderboard/daily", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = res.data.leaderboard;
      setLeaderboard(data);

      // 🔥 find current user
      const me = data.find((u) => u.name === currentUser?.fullName);

      if (me) {
        setMyRank(me.rank);
        setMyTime(me.timeSpent || 0);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // 🔥 TOP 3
  const topThree = leaderboard.slice(0, 3);

  const others = leaderboard.slice(3);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 pt-16 md:pl-64 px-4 sm:px-6 lg:px-8 lg:ml-64">
        <div className="max-w-6xl mx-auto">
        
          {/* Header Section - Responsive */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Leaderboard 🏆</h1>

            {/* Stats Cards */}
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-end">
              {/* TIME CARD */}
              <div className="bg-white px-4 py-3 sm:px-5 sm:py-3 rounded-xl shadow-md border flex flex-col items-center hover:scale-105 transition-all duration-200 min-w-[120px]">
                <span className="text-xs text-gray-500">TOTAL TIME</span>
                <span className="text-base sm:text-lg font-bold text-blue-600">
                  ⏱ {myTime} min
                </span>
              </div>

              {/* RANK CARD */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 sm:px-5 sm:py-3 rounded-xl shadow-md text-white flex flex-col items-center hover:scale-105 transition-all duration-200 min-w-[100px]">
                <span className="text-xs opacity-80">MY RANK</span>
                <span className="text-lg sm:text-xl font-bold">
                  #{myRank || "--"}
                </span>
              </div>
            </div>
          </div>

          {/* 🔥 TOP 3 CARDS - Responsive */}
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end md:justify-center gap-4 sm:gap-6 md:gap-10">
              {topThree.map((user, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center transition-all duration-200 ${
                    i === 0 
                      ? "md:scale-110 md:order-2 md:-mt-8 md:-mb-2" 
                      : i === 1 
                      ? "md:order-1" 
                      : "md:order-3"
                  }`}
                >
                 {i === 0 && (
  <span className="mb-2 px-3 py-1 bg-yellow-500 text-white text-xs sm:text-sm rounded-full shadow-md">
    🏆 CHAMPION
  </span>
)}

{i === 1 && (
  <span className="mb-2 px-3 py-1 bg-gray-400 text-white text-xs sm:text-sm rounded-full shadow-md">
    ⚡ RUNNER-UP
  </span>
)}

{i === 2 && (
  <span className="mb-2 px-3 py-1 bg-orange-500 text-white text-xs sm:text-sm rounded-full shadow-md">
    🔥 RISING STAR
  </span>
)}

                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`
                    }
                    alt={user.name}
                    className={`rounded-full object-cover border-4 border-white shadow-lg ${
                      i === 0 
                        ? "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28" 
                        : "w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
                    }`}
                  />

                  <h3 className="mt-3 text-sm sm:text-base md:text-lg font-semibold text-gray-900 text-center">
                    {user.name}
                  </h3>

                  <p className="text-blue-600 font-bold text-lg sm:text-xl md:text-2xl mt-1">
                    {user.score} pts
                  </p>

                  <div className="flex gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-600 mt-2">
                   <span>{Number(user.accuracy?.toFixed(2) || 0)}%</span>
                    <span className="flex items-center">
                      🔥 {user.streak}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🔥 TABLE - Horizontal scroll on mobile */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
              <h2 className="font-bold text-lg sm:text-xl text-gray-800">Top Performers</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] sm:min-w-[650px]">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 sm:p-4 text-sm sm:text-base font-semibold text-gray-700">Rank</th>
                    <th className="text-left p-3 sm:p-4 text-sm sm:text-base font-semibold text-gray-700">Student</th>
                    <th className="text-left p-3 sm:p-4 text-sm sm:text-base font-semibold text-gray-700 pr-8">Points</th>
                    <th className="text-left p-3 sm:p-4 text-sm sm:text-base font-semibold text-gray-700 px-4">Streak</th>
                    <th className="text-left p-3 sm:p-4 text-sm sm:text-base font-semibold text-gray-700 px-4">Accuracy</th>
                    <th className="text-left p-3 sm:p-4 text-sm sm:text-base font-semibold text-gray-700">Time</th>
                  </tr>
                </thead>

                <tbody>
                  {others.map((user, i) => (
                    <tr
                      key={i}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        currentUser?.fullName === user.name
                          ? "bg-blue-50 border-blue-200" 
                          : ""
                      }`}
                    >
                      <td className="p-3 sm:p-4 font-semibold text-lg sm:text-xl text-gray-900">
                        #{user.rank}
                      </td>

                      <td className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff`
                          }
                          alt={user.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                        />
                        <span className="text-sm sm:text-base font-medium text-gray-900 min-w-0 truncate">
                          {user.name}
                        </span>

                        {currentUser?.fullName === user.name && (
                          <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-full">
                            YOU
                          </span>
                        )}
                      </td>

                      <td className="p-3 sm:p-4 text-blue-600 font-bold text-lg sm:text-xl pr-8">
                        {user.score}
                      </td>

                      <td className="p-3 sm:p-4 px-2 sm:px-4">
                        <Flame size={16} className="inline mr-1 sm:mr-2 text-orange-500" />
                        <span className="text-sm sm:text-base font-medium">{user.streak}</span>
                      </td>

                      <td className="p-3 sm:p-4 px-2 sm:px-4 text-sm sm:text-base text-gray-700">
                        {user.accuracy}%
                      </td>

                      <td className="p-3 sm:p-4 text-sm sm:text-base text-gray-700">
                        ⏱ {user.timeSpent || 0} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <Footer/>
    </>
  );
}
