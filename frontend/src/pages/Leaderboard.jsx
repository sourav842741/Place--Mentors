import React, { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { useSelector } from "react-redux";
import api from "../services/api";
import Navbar from "@/components/Navbar";

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

      <div className="pt-16 md:pl-64 p-4 md:p-6 bg-gray-100 min-h-screen mt-16">
        <div className="max-w-6xl mx-auto">

        
          <div className="flex justify-between items-center mb-6">

            <h1 className="text-3xl font-bold">Campus Leaderboard 🏆</h1>

            <div className="flex gap-4">

              {/* TIME CARD */}
              <div className="bg-white px-5 py-3 rounded-xl shadow-md border flex flex-col items-center hover:scale-105 transition">
                <span className="text-xs text-gray-500">TOTAL TIME</span>
                <span className="text-lg font-bold text-blue-600">
                  ⏱ {myTime} min
                </span>
              </div>

              {/* RANK CARD */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 rounded-xl shadow-md text-white flex flex-col items-center hover:scale-105 transition">
                <span className="text-xs opacity-80">MY RANK</span>
                <span className="text-xl font-bold">
                  #{myRank || "--"}
                </span>
              </div>

            </div>
          </div>

          {/* 🔥 TOP 3 CARDS */}
          <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-end justify-center gap-10">

              {topThree.map((user, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center ${
                    i === 0 ? "order-2 scale-110" : i === 1 ? "order-1" : "order-3"
                  }`}
                >
                  {i === 0 && (
                    <span className="mb-3 px-4 py-1 bg-blue-500 text-white text-xs rounded-full">
                      CHAMPION
                    </span>
                  )}

                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${user.name}`
                    }
                    className={`rounded-full object-cover ${
                      i === 0 ? "w-24 h-24" : "w-20 h-20"
                    }`}
                  />

                  <h3 className="mt-2 font-semibold">{user.name}</h3>

                  <p className="text-blue-600 font-bold text-lg">
                    {user.score} pts
                  </p>

                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>{user.accuracy}%</span>
                    <span>🔥 {user.streak}</span>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* 🔥 TABLE */}
          <div className="bg-white rounded-xl shadow-sm">

            <div className="p-4 border-b font-bold">
              Top Performers
            </div>

            <table className="w-full">

              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Student</th>
                  <th className="text-left p-3">Points</th>
                  <th className="text-left p-3">Streak</th>
                  <th className="text-left p-3">Accuracy</th>
                  <th className="text-left p-3">Time</th>
                </tr>
              </thead>

              <tbody>
                {others.map((user, i) => (
                  <tr
                    key={i}
                    className={`border-b hover:bg-gray-50 ${
                      currentUser?.fullName === user.name
                        ? "bg-blue-50"
                        : ""
                    }`}
                  >
                    <td className="p-3 font-semibold">
                      #{user.rank}
                    </td>

                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${user.name}`
                        }
                        className="w-10 h-10 rounded-full"
                      />
                      <span>{user.name}</span>

                      {currentUser?.fullName === user.name && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                          YOU
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-blue-600 font-semibold">
                      {user.score}
                    </td>

                    <td className="p-3">
                      <Flame size={16} className="inline mr-1 text-orange-500" />
                      {user.streak}
                    </td>

                    <td className="p-3">{user.accuracy}%</td>

                    <td className="p-3">
                      ⏱ {user.timeSpent || 0} min
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>
      </div>
    </>
  );
}