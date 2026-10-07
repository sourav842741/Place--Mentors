import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Trophy,
  Flame,
  Clock,
  Award,
  Crown,
  Medal,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  RefreshCw,
  Users,
  Target,
  Zap,
  TrendingUp,
  X,
} from "lucide-react";
import api from "../services/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useAuth from "../hooks/useAuth";

import {
  safeTrack,
  startCriticalReplay,
  stopReplaySuccess,
} from "../observability/openreplay/events";

// Helper: Extract 1-2 uppercase initials for clean monogram
function getInitials(name = "") {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic vibrant gradient generator for avatars
const AVATAR_GRADIENTS = [
  "from-violet-600 to-indigo-700",
  "from-amber-500 to-rose-600",
  "from-emerald-500 to-teal-700",
  "from-blue-600 to-cyan-600",
  "from-fuchsia-600 to-pink-600",
  "from-purple-600 to-indigo-800",
  "from-orange-500 to-amber-600",
];

function getAvatarGradient(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

// Avatar Component: renders real photo or fallback monogram (never broken/crowded text)
function UserAvatar({ user, size = "md", className = "" }) {
  const [imgError, setImgError] = useState(false);
  const name = user?.name || "Student";
  const initials = getInitials(name);
  const gradient = getAvatarGradient(name);

  // If avatar is ui-avatars.com, we prefer our clean initial monogram to avoid crowded text
  const isExternalUiAvatar = typeof user?.avatar === "string" && user.avatar.includes("ui-avatars.com");
  const hasValidPhoto = Boolean(user?.avatar && !isExternalUiAvatar && !imgError);

  const sizeStyles = {
    sm: "w-8 h-8 text-xs font-bold",
    md: "w-10 h-10 text-sm font-bold",
    lg: "w-16 h-16 text-xl font-extrabold",
    xl: "w-20 h-20 sm:w-24 sm:h-24 text-2xl font-extrabold",
    crown: "w-24 h-24 sm:w-28 sm:h-28 text-3xl font-black",
  }[size] || "w-10 h-10 text-sm font-bold";

  if (hasValidPhoto) {
    return (
      <img
        src={user.avatar}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeStyles} rounded-full object-cover shrink-0 select-none ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeStyles} rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center shrink-0 tracking-wider shadow-inner select-none font-sans ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}

export default function Leaderboard() {
  const { user: currentUser } = useAuth();
  const [topThree, setTopThree] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [myRank, setMyRank] = useState(null);
  const [myTime, setMyTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const LIMIT = 10;

  const fetchLeaderboard = useCallback(async (targetPage = 1, isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

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
      setError("Failed to load leaderboard data. Please check your network and try again.");
      console.error("Leaderboard fetch error:", err);
      safeTrack("leaderboard_fetch_failed", {
        error: err?.message,
      });

      startCriticalReplay("leaderboard_failed", {
        error: err?.message,
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  const handleRefresh = () => {
    safeTrack("leaderboard_manual_refresh", { page });
    fetchLeaderboard(page, true);
  };

  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];
  const safeTopThree = Array.isArray(topThree) ? topThree : [];

  // Filter leaderboard table entries by user name
  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return safeLeaderboard;
    const q = searchQuery.toLowerCase().trim();
    return safeLeaderboard.filter((item) =>
      item.name?.toLowerCase().includes(q)
    );
  }, [safeLeaderboard, searchQuery]);

  // Determine top 3 positions for the Olympic podium
  const champion = safeTopThree[0] || null;
  const runnerUp = safeTopThree[1] || null;
  const thirdPlace = safeTopThree[2] || null;

  // Format study time nicely (e.g., 65 min -> 1h 5m)
  const formatTime = (minutes = 0) => {
    const mins = Number(minutes) || 0;
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  };

  return (
    <>
      <Navbar />

      <main className="pt-24 lg:pt-24 lg:pl-64 px-4 sm:px-6 md:px-8 pb-16 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* ================= HERO & HEADER STRIP ================= */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface via-surface to-surface-2 border border-border p-6 sm:p-8 shadow-sm">
            {/* Ambient background glow accents */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Daily Placement Arena</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text">
                  Platform Leaderboard
                </h1>
                <p className="text-sm text-text-muted mt-1.5 max-w-xl">
                  Real-time daily standings computed across coding practice, topic quizzes, and placement focus hours.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 self-start md:self-center">
                <button
                  onClick={handleRefresh}
                  disabled={loading || isRefreshing}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border hover:bg-surface-2 text-text text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Refresh standings"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-text-muted ${isRefreshing ? "animate-spin text-primary" : ""}`} />
                  <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-border/60">
              {/* Stat 1: Your Rank */}
              <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Your Rank</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-extrabold text-primary">
                      {myRank ? `#${myRank}` : "Unranked"}
                    </span>
                    {myRank && myRank <= 3 && (
                      <span className="text-[10px] font-bold text-amber-500">🏆 Podium</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stat 2: Today's Study Time */}
              <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Focus Time</span>
                  <span className="text-lg font-extrabold text-text">
                    {formatTime(myTime)}
                  </span>
                </div>
              </div>

              {/* Stat 3: Total Competitors */}
              <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Competitors</span>
                  <span className="text-lg font-extrabold text-text">
                    {total} <span className="text-xs font-normal text-text-muted">students</span>
                  </span>
                </div>
              </div>

              {/* Stat 4: Top Score Benchmark */}
              <div className="bg-surface/80 backdrop-blur-sm border border-border/80 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Top Score</span>
                  <span className="text-lg font-extrabold text-amber-500">
                    {safeTopThree[0]?.score ?? 0} <span className="text-xs font-medium text-text-muted">pts</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= ERROR STATE ================= */}
          {error && (
            <div className="bg-danger-soft border border-danger/30 rounded-2xl p-6 text-center">
              <p className="text-danger text-sm font-medium mb-3">{error}</p>
              <button
                onClick={() => fetchLeaderboard(1)}
                className="px-4 py-2 bg-danger text-white text-xs font-semibold rounded-xl hover:bg-danger/90 transition shadow-sm cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ================= LOADING SKELETON ================= */}
          {loading && safeTopThree.length === 0 && (
            <div className="bg-surface rounded-2xl p-12 border border-border text-center shadow-sm">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm font-medium text-text">Loading Leaderboard rankings...</p>
              <p className="text-xs text-text-muted mt-1">Fetching scores and student statistics</p>
            </div>
          )}

          {/* ================= GAMIFIED 3D PODIUM SECTION ================= */}
          {!loading && safeTopThree.length > 0 && (
            <div className="relative rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-sm overflow-hidden">
              {/* Ambient radial spotlight behind champion */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="text-center mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-text flex items-center justify-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Today's Top Performers</span>
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  Leaders leading the scoreboards with highest quiz accuracy, problem solves & consistency
                </p>
              </div>

              {/* The 3 Podium Pedestals: Left (2nd), Center (1st), Right (3rd) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 items-end max-w-4xl mx-auto pt-6 pb-2">
                
                {/* ── 2ND PLACE: RUNNER UP (LEFT) ── */}
                <div
                  data-private
                  className="order-2 md:order-1 flex flex-col items-center text-center group"
                >
                  {/* Badge */}
                  <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-400/15 border border-slate-400/30 text-slate-400 text-xs font-bold shadow-sm">
                    <Medal className="w-3.5 h-3.5 text-slate-300" />
                    <span>RUNNER-UP</span>
                  </div>

                  {/* Avatar with Silver Ring */}
                  <div className="relative mb-3">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 opacity-60 blur-sm group-hover:opacity-100 transition duration-300" />
                    <UserAvatar
                      user={runnerUp}
                      size="xl"
                      className="relative ring-4 ring-slate-300 dark:ring-slate-400 ring-offset-2 ring-offset-surface shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-surface flex items-center justify-center text-slate-800 dark:text-slate-100 font-black text-xs shadow">
                      2
                    </div>
                  </div>

                  {/* Name & Points */}
                  <h3
                    className="text-base font-bold text-text max-w-[200px] truncate"
                    title={runnerUp?.name || "Anonymous"}
                  >
                    {runnerUp?.name || "Runner-Up"}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-600 dark:text-slate-200">
                      {runnerUp?.score ?? 0}
                    </span>
                    <span className="text-xs font-semibold text-text-muted">pts</span>
                  </div>

                  {/* Micro stats */}
                  <div className="flex items-center gap-2 text-xs text-text-muted mt-2 mb-4">
                    <span className="inline-flex items-center gap-1">
                      <Target className="w-3 h-3 text-text-muted" />
                      {Number(runnerUp?.accuracy?.toFixed(1) || 0)}%
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-orange-500 font-medium">
                      <Flame className="w-3.5 h-3.5 fill-orange-500/20" />
                      {runnerUp?.streak ?? 0}
                    </span>
                  </div>

                  {/* 2nd Place Pedestal Block */}
                  <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-slate-400/25 via-slate-400/10 to-surface-2/60 border-t-4 border-slate-300 dark:border-slate-400 border-x border-b border-slate-400/20 flex flex-col items-center justify-center p-3 shadow-sm">
                    <span className="text-2xl sm:text-3xl font-black text-slate-400/80">#2</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">2nd Place</span>
                  </div>
                </div>

                {/* ── 1ST PLACE: CHAMPION (CENTER - ELEVATED) ── */}
                <div
                  data-private
                  className="order-1 md:order-2 flex flex-col items-center text-center group md:-mt-8"
                >
                  {/* Floating Animated Crown */}
                  <div className="relative mb-1">
                    <Crown className="w-9 h-9 text-amber-400 fill-amber-400/40 drop-shadow-[0_4px_16px_rgba(251,191,36,0.6)] animate-bounce" />
                  </div>

                  {/* Gold Champion Pill */}
                  <div className="mb-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/20">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>CHAMPION</span>
                  </div>

                  {/* Avatar with Gold Ring & Shimmer Aura */}
                  <div className="relative mb-3">
                    <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-70 blur-md group-hover:opacity-100 transition duration-300 animate-pulse" />
                    <UserAvatar
                      user={champion}
                      size="crown"
                      className="relative ring-4 ring-amber-400 ring-offset-4 ring-offset-surface shadow-2xl"
                    />
                    <div className="absolute -bottom-2.5 -right-1 w-8 h-8 rounded-full bg-amber-400 border-2 border-surface flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                      1
                    </div>
                  </div>

                  {/* Name & Points */}
                  <h3
                    className="text-lg font-extrabold text-text max-w-[220px] truncate"
                    title={champion?.name || "Champion"}
                  >
                    {champion?.name || "Champion"}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-amber-500 drop-shadow-sm">
                      {champion?.score ?? 0}
                    </span>
                    <span className="text-xs font-bold text-amber-500/80">pts</span>
                  </div>

                  {/* Micro stats */}
                  <div className="flex items-center gap-2.5 text-xs text-text-muted mt-2 mb-4">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Target className="w-3.5 h-3.5 text-emerald-500" />
                      {Number(champion?.accuracy?.toFixed(1) || 0)}% acc
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-orange-500 font-bold">
                      <Flame className="w-4 h-4 fill-orange-500/20" />
                      {champion?.streak ?? 0} streak
                    </span>
                  </div>

                  {/* 1st Place Pedestal Block (TALLEST) */}
                  <div className="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-t from-amber-500/25 via-amber-500/10 to-surface-2/80 border-t-4 border-amber-400 border-x border-b border-amber-500/30 flex flex-col items-center justify-center p-3 shadow-md">
                    <Trophy className="w-6 h-6 text-amber-400 mb-1" />
                    <span className="text-3xl sm:text-4xl font-black text-amber-500">#1</span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-500 mt-0.5">Top Performer</span>
                  </div>
                </div>

                {/* ── 3RD PLACE: RISING STAR (RIGHT) ── */}
                <div
                  data-private
                  className="order-3 flex flex-col items-center text-center group"
                >
                  {/* Badge */}
                  <div className="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-700/15 border border-amber-700/30 text-amber-600 dark:text-amber-500 text-xs font-bold shadow-sm">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                    <span>RISING STAR</span>
                  </div>

                  {/* Avatar with Bronze Ring */}
                  <div className="relative mb-3">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 opacity-50 blur-sm group-hover:opacity-90 transition duration-300" />
                    <UserAvatar
                      user={thirdPlace}
                      size="xl"
                      className="relative ring-4 ring-amber-600 dark:ring-amber-500 ring-offset-2 ring-offset-surface shadow-lg"
                    />
                    <div className="absolute -bottom-2 -right-1 w-7 h-7 rounded-full bg-amber-700 border-2 border-surface flex items-center justify-center text-white font-black text-xs shadow">
                      3
                    </div>
                  </div>

                  {/* Name & Points */}
                  <h3
                    className="text-base font-bold text-text max-w-[200px] truncate"
                    title={thirdPlace?.name || "Anonymous"}
                  >
                    {thirdPlace?.name || "Rising Star"}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-amber-700 dark:text-amber-500">
                      {thirdPlace?.score ?? 0}
                    </span>
                    <span className="text-xs font-semibold text-text-muted">pts</span>
                  </div>

                  {/* Micro stats */}
                  <div className="flex items-center gap-2 text-xs text-text-muted mt-2 mb-4">
                    <span className="inline-flex items-center gap-1">
                      <Target className="w-3 h-3 text-text-muted" />
                      {Number(thirdPlace?.accuracy?.toFixed(1) || 0)}%
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-orange-500 font-medium">
                      <Flame className="w-3.5 h-3.5 fill-orange-500/20" />
                      {thirdPlace?.streak ?? 0}
                    </span>
                  </div>

                  {/* 3rd Place Pedestal Block */}
                  <div className="w-full h-20 sm:h-24 rounded-t-2xl bg-gradient-to-t from-amber-700/25 via-amber-700/10 to-surface-2/60 border-t-4 border-amber-600 border-x border-b border-amber-700/20 flex flex-col items-center justify-center p-3 shadow-sm">
                    <span className="text-2xl sm:text-3xl font-black text-amber-700/80 dark:text-amber-500/80">#3</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 mt-0.5">3rd Place</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ================= ALL RANKINGS TABLE ================= */}
          <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
            {/* Toolbar Header */}
            <div className="p-4 sm:p-5 border-b border-border bg-surface-2/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-text flex items-center gap-2">
                  <span>Student Rankings</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-2 border border-border text-text-muted text-xs font-bold">
                    {total} Total
                  </span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Points computed from quiz accuracy (2x), questions solved (5x) and focus time (0.5x).
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface border border-border text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-2/50 border-b border-border text-text-muted text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6 w-20">Rank</th>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4 text-right sm:text-left">Points</th>
                    <th className="py-3.5 px-4 hidden sm:table-cell">Streak</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">Accuracy</th>
                    <th className="py-3.5 px-4 hidden lg:table-cell">Focus Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {/* Empty Search Result */}
                  {filteredLeaderboard.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} className="py-12 px-4 text-center">
                        <Users className="w-8 h-8 text-text-muted/40 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-text">No students found</p>
                        <p className="text-xs text-text-muted mt-1">
                          {searchQuery
                            ? `No students matching "${searchQuery}". Try a different keyword.`
                            : "No ranked students available on this page."}
                        </p>
                      </td>
                    </tr>
                  )}

                  {filteredLeaderboard.map((user) => {
                    const isCurrentUser = Boolean(
                      (currentUser?._id && currentUser._id === user.userId) ||
                      (myRank && user.rank === myRank)
                    );

                    // Rank badge styling
                    const isTop1 = user.rank === 1;
                    const isTop2 = user.rank === 2;
                    const isTop3 = user.rank === 3;

                    return (
                      <tr
                        data-private
                        key={user.rank || user.userId || user.name}
                        className={`transition-colors ${
                          isCurrentUser
                            ? "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary font-medium"
                            : "hover:bg-surface-2/40"
                        }`}
                      >
                        {/* RANK */}
                        <td className="py-3.5 px-4 sm:px-6">
                          {isTop1 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 font-extrabold text-xs shadow-sm">
                              🥇 #1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-400/15 border border-slate-400/30 text-slate-400 font-extrabold text-xs shadow-sm">
                              🥈 #2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-700/15 border border-amber-700/30 text-amber-600 dark:text-amber-500 font-extrabold text-xs shadow-sm">
                              🥉 #3
                            </span>
                          ) : (
                            <span className="inline-block w-8 text-center text-xs font-bold text-text-muted">
                              #{user.rank}
                            </span>
                          )}
                        </td>

                        {/* STUDENT INFO */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} size="md" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-text truncate max-w-[160px] sm:max-w-xs">
                                  {user.name || "Anonymous Student"}
                                </span>
                                {isCurrentUser && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-primary text-on-primary">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-text-muted block sm:hidden">
                                🔥 {user.streak ?? 0} streak • {Number(user.accuracy || 0).toFixed(0)}% acc
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* POINTS */}
                        <td className="py-3.5 px-4 text-right sm:text-left">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-2 border border-border text-sm font-extrabold text-primary">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {user.score ?? 0}
                          </span>
                        </td>

                        {/* STREAK */}
                        <td className="py-3.5 px-4 hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-semibold">
                            <Flame className="w-3.5 h-3.5 fill-orange-500/20" />
                            <span>{user.streak ?? 0} days</span>
                          </span>
                        </td>

                        {/* ACCURACY */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-text font-semibold">{Number(user.accuracy || 0).toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(0, user.accuracy || 0))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* FOCUS TIME */}
                        <td className="py-3.5 px-4 hidden lg:table-cell">
                          <span className="inline-flex items-center gap-1 text-xs text-text-muted font-medium">
                            <Clock className="w-3.5 h-3.5 text-text-subtle" />
                            {formatTime(user.timeSpent)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ================= PAGINATION ================= */}
            {pages > 1 && (
              <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface">
                <p className="text-xs text-text-muted">
                  Showing page <span className="font-bold text-text">{page}</span> of{" "}
                  <span className="font-bold text-text">{pages}</span>
                  <span className="mx-1.5">•</span>
                  {total} students registered
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      safeTrack("leaderboard_prev_clicked", { currentPage: page });
                      handlePageChange(page - 1);
                    }}
                    disabled={page === 1 || loading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-text hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-semibold cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                      // Smart page pagination window
                      let pNum = i + 1;
                      if (pages > 5 && page > 3) {
                        pNum = page - 3 + i;
                        if (pNum > pages) pNum = pages - (4 - i);
                      }
                      if (pNum < 1) pNum = 1;

                      const isActive = pNum === page;
                      return (
                        <button
                          key={pNum}
                          onClick={() => handlePageChange(pNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                            isActive
                              ? "bg-primary text-on-primary shadow-sm"
                              : "border border-border text-text hover:bg-surface-2"
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      safeTrack("leaderboard_next_clicked", { currentPage: page });
                      handlePageChange(page + 1);
                    }}
                    disabled={page === pages || loading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-border text-text hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-semibold cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Loading indicator overlay during page changes */}
            {loading && safeTopThree.length > 0 && (
              <div className="p-6 text-center border-t border-border bg-surface-2/20">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-text-muted mt-2 font-medium">Updating rankings...</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

