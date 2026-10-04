import React, { useEffect, useState, useCallback } from "react";
import { Flame, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import api from "../services/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import {
  safeTrack,
  startCriticalReplay,
  stopReplaySuccess,
} from "../observability/openreplay/events";

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
      safeTrack("leaderboard_fetch_started", {
        page: targetPage,
      });
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
      safeTrack("leaderboard_fetch_success", {
        page: data.page || targetPage,
        total: data.total || 0,
      });

      stopReplaySuccess("leaderboard");
    } catch (err) {
      setError("Failed to load leaderboard");
      console.error("Leaderboard fetch error:", err);
      safeTrack("leaderboard_fetch_failed", {
        error: err?.message,
      });

      startCriticalReplay("leaderboard_failed", {
        error: err?.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    safeTrack("leaderboard_opened", {});

    startCriticalReplay("leaderboard", {});
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
    safeTrack("leaderboard_page_changed", {
      page: newPage,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];
  const safeTopThree = Array.isArray(topThree) ? topThree : [];

  return (
    <>
      <Navbar />

      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
                Platform Leaderboard
              </h1>
              <p className="text-xs text-text-muted mt-1">Top performers across quizzes, coding problems and practice sessions</p>
            </div>

            <div className="flex items-center gap-3">
              {/* TIME */}
              <div className="bg-surface border border-border px-4 py-2 rounded-lg text-center shadow-subtle">
                <span className="text-[10px] font-semibold text-text-subtle uppercase block">Study Time</span>
                <span className="text-sm font-bold text-text">{myTime} min</span>
              </div>

              {/* RANK */}
              <div className="bg-primary-soft border border-primary/20 px-4 py-2 rounded-lg text-center">
                <span className="text-[10px] font-semibold text-primary uppercase block">Your Rank</span>
                <span className="text-sm font-bold text-primary">#{myRank || "--"}</span>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading && safeTopThree.length === 0 && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="bg-danger-soft border border-danger/20 rounded-xl p-6 text-center mb-8">
              <p className="text-danger text-xs mb-3">{error}</p>
              <button
                onClick={() => {
                  safeTrack("leaderboard_retry_clicked", {});
                  fetchLeaderboard(1);
                }}
                className="px-4 py-2 bg-danger text-white text-xs font-medium rounded-lg hover:bg-danger/90 transition cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* TOP 3 PODIUM */}
          {!loading && safeTopThree.length > 0 && (
            <div className="bg-surface rounded-xl p-6 sm:p-8 mb-8 shadow-subtle border border-border">
              <div className="flex flex-col md:flex-row md:items-end md:justify-center gap-6 md:gap-10">
                {safeTopThree.map((user, i) => (
                  <div
                    data-private
                    key={user.rank || i}
                    className={`flex flex-col items-center transition-all duration-300 ${
                      i === 0
                        ? "md:scale-110 md:order-2 md:-mt-6"
                        : i === 1
                          ? "md:order-1"
                          : "md:order-3"
                    }`}
                  >
                    {/* BADGES */}
                    {i === 0 && (
                      <span className="mb-2 px-3 py-1 bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[11px] font-bold rounded-full shadow-sm">
                        🏆 CHAMPION
                      </span>
                    )}
                    {i === 1 && (
                      <span className="mb-2 px-3 py-1 bg-slate-500/15 text-slate-400 border border-slate-500/30 text-[11px] font-bold rounded-full shadow-sm">
                        ⚡ RUNNER-UP
                      </span>
                    )}
                    {i === 2 && (
                      <span className="mb-2 px-3 py-1 bg-orange-500/15 text-orange-500 border border-orange-500/30 text-[11px] font-bold rounded-full shadow-sm">
                        🔥 RISING STAR
                      </span>
                    )}

                    {/* AVATAR */}
                    <img
                      src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || "U"
                        )}&background=059669&color=fff`
                      }
                      alt={user.name || "User"}
                      className={`rounded-full object-cover border-4 border-surface shadow-md ${
                        i === 0 ? "w-24 h-24 md:w-28 md:h-28" : "w-20 h-20 md:w-24 md:h-24"
                      }`}
                    />

                    {/* NAME */}
                    <h3 className="mt-3 text-sm sm:text-base font-semibold text-text text-center">
                      {user.name || "Anonymous"}
                    </h3>

                    {/* SCORE */}
                    <p className="text-primary font-bold text-lg sm:text-xl md:text-2xl mt-0.5">
                      {user.score ?? 0} pts
                    </p>

                    {/* STATS */}
                    <div className="flex gap-3 text-xs text-text-muted mt-1.5">
                      <span>{Number(user.accuracy?.toFixed(2) || 0)}% acc</span>
                      <span>•</span>
                      <span>🔥 {user.streak ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABLE */}
          <div className="bg-surface rounded-xl shadow-subtle border border-border overflow-hidden">
            <div className="p-5 border-b border-border bg-surface-2/40 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-base text-text">Top Performers</h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {total} ranked students
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-2/70 border-b border-border">
                  <tr>
                    <th className="p-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Rank</th>
                    <th className="p-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Student</th>
                    <th className="p-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Points</th>
                    <th className="p-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Streak</th>
                    <th className="p-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Accuracy</th>
                    <th className="p-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {safeLeaderboard.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-text-muted text-xs">
                        No more entries on this page.
                      </td>
                    </tr>
                  )}

                  {safeLeaderboard.map((user) => (
                    <tr
                      data-private
                      key={user.rank || user.userId || user.name}
                      className="border-b border-border/50 hover:bg-surface-2/40 transition-colors"
                    >
                      <td className="p-3.5 font-bold text-text text-sm">#{user.rank}</td>
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={
                            user.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name || "U"
                            )}`
                          }
                          className="w-9 h-9 rounded-full object-cover border border-border"
                          alt={user.name || "User"}
                        />
                        <span className="text-text font-medium text-sm">
                          {user.name || "Anonymous"}
                        </span>
                      </td>
                      <td className="p-3.5 text-primary font-bold text-sm">{user.score ?? 0}</td>
                      <td className="p-3.5 text-text-muted text-xs">
                        <span className="inline-flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-orange-500" />
                          {user.streak ?? 0}
                        </span>
                      </td>
                      <td className="p-3.5 text-text-muted text-xs">
                        {Number(user.accuracy || 0).toFixed(1)}%
                      </td>
                      <td className="p-3.5 text-text-muted text-xs">
                        ⏱ {user.timeSpent || 0} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {pages > 1 && (
              <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface">
                <p className="text-xs text-text-muted">
                  Page{" "}
                  <span className="font-semibold text-text">{page}</span> of{" "}
                  <span className="font-semibold text-text">{pages}</span>
                  {" · "}
                  {total} entries
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      safeTrack("leaderboard_prev_clicked", {
                        currentPage: page,
                      });

                      handlePageChange(page - 1);
                    }}
                    disabled={page === 1 || loading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-text hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>

                  <button
                    onClick={() => {
                      safeTrack("leaderboard_next_clicked", {
                        currentPage: page,
                      });

                      handlePageChange(page + 1);
                    }}
                    disabled={page === pages || loading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-text hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-medium cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* LOADING OVERLAY FOR PAGE CHANGE */}
            {loading && safeTopThree.length > 0 && (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-text-muted mt-2">Loading...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
