import React, { useEffect, useState } from "react";
import {
  Bell, Sun, Search, Filter, TrendingUp,
  ChevronRight, Flame
} from "lucide-react";
import { useSelector } from "react-redux";
import api from "../services/api";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);

  const currentUser = useSelector((state) => state.user.user);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/api/leaderboard/daily", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLeaderboard(res.data.leaderboard);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // 🔥 DATA SPLIT
  const topThree = leaderboard.slice(0, 3).map((user, i) => ({
    rank: i + 1,
    name: user.name,
    points: user.score,
    accuracy: user.accuracy,
    streak: user.streak,
    image:
      user.avatar && user.avatar !== "null"
        ? user.avatar
        : `https://ui-avatars.com/api/?name=${user.name}&background=2563eb&color=fff`,
    champion: i === 0,
  }));

  const performers = leaderboard.slice(3).map((user, i) => ({
    rank: i + 4,
    name: user.name,
    points: user.score,
    accuracy: user.accuracy,
    streak: user.streak,
    image:
      user.avatar && user.avatar !== "null"
        ? user.avatar
        : `https://ui-avatars.com/api/?name=${user.name}&background=2563eb&color=fff`,
    badge: currentUser?.fullName === user.name ? "YOU" : null,
  }));

  return (
    <> 
    <Navbar />

  {/* Right Side */}
<div className="ml-64 pt-20 p-6 bg-gray-100 min-h-screen">
    <Sidebar/>

    
   

    {/* Content */}
    <div className="p-6 max-w-6xl mx-auto">

      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-6">
        Campus Leaderboard 🏆
      </h1>

      {/* 🥇 TOP 3 */}
      <div className="bg-white rounded-xl p-8 mb-8 shadow-sm">
        <div className="flex items-end justify-center gap-10">
          {topThree.map((person) => (
            <div
              key={person.rank}
              className={`flex flex-col items-center ${
                person.rank === 1
                  ? "order-2 scale-110"
                  : person.rank === 2
                  ? "order-1"
                  : "order-3"
              }`}
            >
              {person.rank === 1 && (
                <span className="mb-3 px-4 py-1 bg-blue-600 text-white text-xs rounded-full">
                  CHAMPION
                </span>
              )}

              <div className="relative mb-3">
                <img
                  src={person.image}
                  className={`rounded-full object-cover ${
                    person.rank === 1 ? "w-24 h-24" : "w-20 h-20"
                  }`}
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full px-3 py-1 text-sm font-bold shadow">
                  {person.rank}
                </div>
              </div>

              <h3 className="font-semibold text-gray-900">
                {person.name}
              </h3>

              <p className="text-blue-600 font-bold text-lg">
                {person.points} pts
              </p>

              <div className="flex gap-6 mt-2 text-sm text-gray-600">
                <span>{person.accuracy}%</span>
                <span>🔥 {person.streak}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
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
            </tr>
          </thead>

          <tbody>
            {performers.map((p) => (
              <tr key={p.rank} className="border-b hover:bg-gray-50">
                <td className="p-3">#{p.rank}</td>

                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{p.name}</span>
                        {p.badge && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="p-3 text-blue-600 font-semibold">
                  {p.points}
                </td>

                <td className="p-3">🔥 {p.streak}</td>

                <td className="p-3">{p.accuracy}%</td>
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