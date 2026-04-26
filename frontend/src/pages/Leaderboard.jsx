import React, { useEffect, useState, useCallback } from "react";
import { Flame, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from "../services/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Leaderboard() {
  const [topThree, setTopThree] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [myRank, setMyRank] = useState(null);
  const [myTime, setMyTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const LIMIT = 10;

  const fetchLeaderboard = useCallback(async (targetPage = 1) => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/api/leaderboard/daily", {
        params: { page: targetPage, limit: LIMIT },
      });

      const data = res.data;
      setTopThree(Array.isArray(data.topThree) ? data.topThree : []);
      setLeaderboard(Array.isArray(data.leaderboard) ? data.leaderboard : []);
      setPage(data.page || targetPage);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
      setMyRank(data.myRank ?? null);
      setMyTime(data.myTime ?? 0);
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error("Leaderboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(1);
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (page > 1) {
      fetchLeaderboard(page);
    }
  }, [page, fetchLeaderboard]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pages || newPage === page) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];
  const safeTopThree = Array.isArray(topThree) ? topThree : [];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 pt-16 px-4 sm:px-6 lg:px-8 transition-colors duration-300 lg:ml-64">
        <div className="max-w-6xl mx-auto">
          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white md:mt-8 sm:mt-8">
              Leaderboard 🏆
            </h1>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
              {/* TIME */}
              <div className="bg-white dark:bg-gray-900 px-5 py-3 rounded-xl shadow-md border dark:border-white/10 flex flex-col items-center hover:scale-105 transition">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  TOTAL TIME
                </span>
                <span className="text-lg font-bold text-blue-600">
                  ⏱ {myTime} min
                </span>
              </div>

              {/* RANK */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-3 rounded-xl shadow-md text-white flex flex-col items-center hover:scale-105 transition">
                <span className="text-xs opacity-80">MY RANK</span>
                <span className="text-xl font-bold">
                  #{myRank || "--"}
                </span>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading && safeTopThree.length === 0 && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center mb-8">
              <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
              <button
                onClick={() => fetchLeaderboard(1)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* TOP 3 */}
          {!loading && safeTopThree.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 md:p-8 mb-8 shadow-sm border dark:border-white/10">
              <div className="flex flex-col md:flex-row md:items-end md:justify-center gap-6 md:gap-10">
                {safeTopThree.map((user, i) => (
                  <div
                    key={user.rank || i}
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

                    {/* AVATAR */}
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || "U"
                        )}&background=6366f1&color=fff`
                      }
                      alt={user.name || "User"}
                      className={`rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-lg ${
                        i === 0
                          ? "w-24 h-24 md:w-28 md:h-28"
                          : "w-20 h-20 md:w-24 md:h-24"
                      }`}
                    />

                    {/* NAME */}
                    <h3 className="mt-3 text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white text-center">
                      {user.name || "Anonymous"}
                    </h3>

                    {/* SCORE */}
                    <p className="text-blue-600 font-bold text-lg sm:text-xl md:text-2xl mt-1">
                      {user.score ?? 0} pts
                    </p>

                    {/* STATS */}
                    <div className="flex gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <span>{Number(user.accuracy?.toFixed(2) || 0)}%</span>
                      <span>🔥 {user.streak ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABLE */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-white/10 overflow-hidden">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <h2 className="font-bold text-xl text-gray-800 dark:text-white">
                Top Performers
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {total} ranked students
              </p>
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
                  {safeLeaderboard.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No more entries on this page.
                      </td>
                    </tr>
                  )}

                  {safeLeaderboard.map((user) => (
                    <tr
                      key={user.rank || user.userId || user.name}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-4 font-bold text-gray-900 dark:text-white">
                        #{user.rank}
                      </td>
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name || "U"
                            )}`
                          }
                          className="w-10 h-10 rounded-full object-cover"
                          alt={user.name || "User"}
                        />
                        <span className="text-gray-900 dark:text-white">
                          {user.name || "Anonymous"}
                        </span>
                      </td>
                      <td className="p-4 text-blue-600 font-bold">
                        {user.score ?? 0}
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          {user.streak ?? 0}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        {Number(user.accuracy || 0).toFixed(1)}%
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        ⏱ {user.timeSpent || 0} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {pages > 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Page <span className="font-semibold text-gray-700 dark:text-gray-300">{page}</span> of{" "}
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{pages}</span>
                  {" · "}
                  {total} entries
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1 || loading}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === pages || loading}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* LOADING OVERLAY FOR PAGE CHANGE */}
            {loading && safeTopThree.length > 0 && (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Loading...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

