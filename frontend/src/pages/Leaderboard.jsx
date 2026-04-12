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

     <div className="min-h-screen 
bg-gray-100 dark:bg-gray-950 
pt-16 md:pl-64 px-4 sm:px-6 lg:px-8 transition-colors duration-300 lg:ml-64">

  <div className="max-w-6xl mx-auto">

    {/* HEADER */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
        Leaderboard 🏆
      </h1>

      <div className="flex flex-wrap gap-4 justify-center lg:justify-end">

        {/* TIME */}
        <div className="bg-white dark:bg-gray-900 
        px-5 py-3 rounded-xl shadow-md border dark:border-white/10 
        flex flex-col items-center hover:scale-105 transition">

          <span className="text-xs text-gray-500 dark:text-gray-400">
            TOTAL TIME
          </span>

          <span className="text-lg font-bold text-blue-600">
            ⏱ {myTime} min
          </span>

        </div>

        {/* RANK */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 
        px-5 py-3 rounded-xl shadow-md text-white 
        flex flex-col items-center hover:scale-105 transition">

          <span className="text-xs opacity-80">MY RANK</span>

          <span className="text-xl font-bold">
            #{myRank || "--"}
          </span>

        </div>

      </div>
    </div>

    {/* TOP 3 */}
    <div className="bg-white dark:bg-gray-900 
rounded-xl p-4 sm:p-6 md:p-8 mb-8 shadow-sm border dark:border-white/10">

  <div className="flex flex-col md:flex-row md:items-end md:justify-center gap-6 md:gap-10">

    {topThree.map((user, i) => (
      <div
        key={i}
        className={`flex flex-col items-center transition-all duration-300 ${
          i === 0
            ? "md:scale-110 md:order-2 md:-mt-8"
            : i === 1
            ? "md:order-1"
            : "md:order-3"
        }`}
      >

        {/* BADGES */}
        {i === 0 && (
          <span className="mb-2 px-3 py-1 
          bg-yellow-500 text-white text-xs sm:text-sm 
          rounded-full shadow-md">
            🏆 CHAMPION
          </span>
        )}

        {i === 1 && (
          <span className="mb-2 px-3 py-1 
          bg-gray-400 text-white text-xs sm:text-sm 
          rounded-full shadow-md">
            ⚡ RUNNER-UP
          </span>
        )}

        {i === 2 && (
          <span className="mb-2 px-3 py-1 
          bg-orange-500 text-white text-xs sm:text-sm 
          rounded-full shadow-md">
            🔥 RISING STAR
          </span>
        )}

        {/* AVATAR */}
        <img
          src={
            user.avatar ||
            `https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`
          }
          alt={user.name}
          className={`rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-lg ${
            i === 0
              ? "w-24 h-24 md:w-28 md:h-28"
              : "w-20 h-20 md:w-24 md:h-24"
          }`}
        />

        {/* NAME */}
        <h3 className="mt-3 text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white text-center">
          {user.name}
        </h3>

        {/* SCORE */}
        <p className="text-blue-600 font-bold text-lg sm:text-xl md:text-2xl mt-1">
          {user.score} pts
        </p>

        {/* STATS */}
        <div className="flex gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
          <span>{Number(user.accuracy?.toFixed(2) || 0)}%</span>
          <span>🔥 {user.streak}</span>
        </div>

      </div>
    ))}

  </div>
</div>

    {/* TABLE */}
    <div className="bg-white dark:bg-gray-900 
    rounded-xl shadow-sm border dark:border-white/10 overflow-hidden">

      <div className="p-6 border-b 
      bg-gradient-to-r from-gray-50 to-gray-100 
      dark:from-gray-800 dark:to-gray-900">

        <h2 className="font-bold text-xl text-gray-800 dark:text-white">
          Top Performers
        </h2>

      </div>

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="p-4 text-left text-gray-700 dark:text-gray-300">Rank</th>
              <th className="p-4 text-left text-gray-700 dark:text-gray-300">Student</th>
              <th className="p-4 text-left text-gray-700 dark:text-gray-300">Points</th>
              <th className="p-4 text-left text-gray-700 dark:text-gray-300">Streak</th>
              <th className="p-4 text-left text-gray-700 dark:text-gray-300">Accuracy</th>
              <th className="p-4 text-left text-gray-700 dark:text-gray-300">Time</th>
            </tr>
          </thead>

          <tbody>

            {others.map((user, i) => (
              <tr
                key={i}
                className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  currentUser?.fullName === user.name
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : ""
                }`}
              >

                <td className="p-4 font-bold text-gray-900 dark:text-white">
                  #{user.rank}
                </td>

                <td className="p-4 flex items-center gap-3">

                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`}
                    className="w-10 h-10 rounded-full"
                  />

                  <span className="text-gray-900 dark:text-white">
                    {user.name}
                  </span>

                </td>

                <td className="p-4 text-blue-600 font-bold">
                  {user.score}
                </td>

                <td className="p-4 text-gray-700 dark:text-gray-300">
                  🔥 {user.streak}
                </td>

                <td className="p-4 text-gray-700 dark:text-gray-300">
                  {user.accuracy}%
                </td>

                <td className="p-4 text-gray-700 dark:text-gray-300">
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
