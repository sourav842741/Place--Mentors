import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Calendar,
  CalendarCheck,
  Eye,
  Sparkles,
  Clock,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Search,
  Trash2,
  Play,
  Target,
  TrendingUp,
  Flame,
  BookOpen,
  Layers,
  ExternalLink,
  ChevronRight,
  Plus,
  AlertCircle,
  Compass,
  Award,
  Zap,
  Building2,
  Timer,
  Check,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "../services/api";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Curated battle-tested industry blueprints
const CURATED_BLUEPRINTS = [
  {
    id: "faang-sde",
    title: "FAANG SDE-1 DSA Master Sprint",
    company: "Google / Amazon / Meta",
    badge: "Top Tier Product",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    daysLeft: 45,
    dailyHours: 4,
    level: "advanced",
    totalXP: 2800,
    tasksCount: 135,
    description:
      "High-intensity 45-day algorithmic mastery sprint covering Blind 75, complex DP patterns, Graph traversals, and Low-Level Object Oriented Design.",
    topics: ["Blind 75 & Striver Sheet", "DP on Trees & Subsequences", "Graphs (Dijkstra, MST)", "LLD & Clean Code"],
    gradient: "from-emerald-500/10 via-teal-500/5 to-cyan-500/10",
    borderAccent: "hover:border-emerald-500/40",
  },
  {
    id: "mern-architect",
    title: "Full-Stack MERN & Cloud Architect",
    company: "Unicorns (Swiggy, Razorpay)",
    badge: "High Growth Startups",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    daysLeft: 30,
    dailyHours: 3.5,
    level: "intermediate",
    totalXP: 2200,
    tasksCount: 90,
    description:
      "Build production-grade full-stack architectures. Covers React 19 Server Components, Node.js microservices, Redis caching, and Docker deployments.",
    topics: ["React 19 & Next.js", "Redis Caching & Queues", "Microservices & Auth", "Docker & CI/CD Pipelines"],
    gradient: "from-blue-500/10 via-indigo-500/5 to-violet-500/10",
    borderAccent: "hover:border-blue-500/40",
  },
  {
    id: "mass-recruiter",
    title: "TCS Digital / Prime & Mass Recruiter Fast-Track",
    company: "TCS, Infosys, Wipro, Accenture",
    badge: "Mass Placement Ready",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    daysLeft: 15,
    dailyHours: 3,
    level: "beginner",
    totalXP: 1400,
    tasksCount: 45,
    description:
      "Sprint through TCS NQT & Tier-1 IT hiring rounds. Quantitative aptitude, logical puzzles, Core CS (DBMS, OS, CN), and hands-on coding rounds.",
    topics: ["Advanced NQT Aptitude", "Core CS: DBMS, OS, Networks", "Java / C++ DSA Essentials", "HR & Technical Mock Drills"],
    gradient: "from-amber-500/10 via-orange-500/5 to-yellow-500/10",
    borderAccent: "hover:border-amber-500/40",
  },
  {
    id: "dsa-zero-hero",
    title: "Striver A2Z DSA Foundation & Core CS",
    company: "General SDE & Off-Campus Drives",
    badge: "Foundation Builder",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    daysLeft: 60,
    dailyHours: 2.5,
    level: "intermediate",
    totalXP: 3600,
    tasksCount: 160,
    description:
      "Zero-to-hero comprehensive roadmap. Master data structures from basics, two-pointers, recursion, trees, heaps, up to LeetCode Medium/Hard.",
    topics: ["Arrays, Strings & 2-Pointers", "Recursion & Backtracking", "Trees, Heaps & Tries", "Greedy & Bit Manipulation"],
    gradient: "from-purple-500/10 via-pink-500/5 to-rose-500/10",
    borderAccent: "hover:border-purple-500/40",
  },
];

export default function PlannerHistory() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [planners, setPlanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarStatus, setCalendarStatus] = useState({
    authorized: false,
    loading: true,
  });
  const [syncing, setSyncing] = useState({});
  const [syncingAll, setSyncingAll] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all', 'in-progress', 'completed', 'calendar-synced'
  const [sortBy, setSortBy] = useState("newest"); // 'newest', 'progress', 'days'

  // Modal State for Quick Creation
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    goal: "",
    company: "",
    daysLeft: 30,
    dailyHours: 3,
    level: "intermediate",
  });

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [plannerToDelete, setPlannerToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchPlanners();

      try {
        const res = await api.get("/api/planner/calendar/status", {
          withCredentials: true,
        });
        setCalendarStatus({ ...res.data, loading: false });
      } catch (err) {
        console.error("Calendar status error:", err);
        setCalendarStatus({ authorized: false, loading: false });
      }
    };
    loadData();

    // Check query params for Google Calendar connection return
    if (searchParams.get("calendar") === "connected") {
      toast.success("Google Calendar connected successfully! 📅");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  const fetchPlanners = async () => {
    try {
      const res = await api.get("/api/planner/all", { withCredentials: true });
      if (Array.isArray(res.data)) {
        setPlanners(res.data);
      } else {
        setPlanners([]);
      }
    } catch (err) {
      console.error("Failed to fetch planners");
      setPlanners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    try {
      const res = await api.get("/api/planner/calendar/auth", {
        withCredentials: true,
      });
      if (res.data?.authUrl) {
        window.location.href = res.data.authUrl;
      } else {
        toast.error("Could not obtain Google authorization URL");
      }
    } catch (err) {
      toast.error("Failed to initialize Google Calendar authentication");
    }
  };

  const syncPlannerToCalendar = async (plannerId) => {
    if (!planners.length) {
      toast.error("No roadmap available to sync");
      return;
    }
    setSyncing((prev) => ({ ...prev, [plannerId]: true }));
    try {
      const res = await api.post("/api/planner/calendar", { plannerId }, { withCredentials: true });
      toast.success(`Synced ${res.data.syncedCount || "daily"} study sessions to your Google Calendar!`);
      // Update local state to mark synced
      setPlanners((prev) =>
        prev.map((p) => (p._id === plannerId ? { ...p, syncedToCalendar: new Date() } : p))
      );
    } catch (err) {
      console.error("Sync error:", err.response?.data);
      toast.error(err.response?.data?.message || "Sync failed. Please check permissions.");
    } finally {
      setSyncing((prev) => ({ ...prev, [plannerId]: false }));
    }
  };

  const syncAllPlanners = async () => {
    if (!planners.length) return;
    setSyncingAll(true);
    let successCount = 0;
    try {
      for (const p of planners) {
        try {
          await api.post("/api/planner/calendar", { plannerId: p._id }, { withCredentials: true });
          successCount++;
        } catch (e) {
          console.warn("Error syncing planner", p._id, e);
        }
      }
      toast.success(`Successfully synced ${successCount} roadmaps to Google Calendar!`);
      fetchPlanners();
    } catch (err) {
      toast.error("Error running batch sync");
    } finally {
      setSyncingAll(false);
    }
  };

  const handleDeletePlanner = async () => {
    if (!plannerToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/planner/${plannerToDelete._id}`, { withCredentials: true });
      toast.success("Roadmap deleted successfully");
      setPlanners((prev) => prev.filter((p) => p._id !== plannerToDelete._id));
      setDeleteModalOpen(false);
      setPlannerToDelete(null);
    } catch (err) {
      console.error("Delete planner error:", err);
      toast.error(err.response?.data?.message || "Failed to delete roadmap");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.goal.trim()) {
      toast.error("Please enter a target role or preparation goal");
      return;
    }
    setCreating(true);
    try {
      const res = await api.post("/api/planner/create", formData, { withCredentials: true });
      toast.success("New AI Roadmap generated successfully! 🚀");
      setCreateModalOpen(false);
      const newPlannerId = res.data?.plannerId || res.data?._id;
      if (newPlannerId) {
        navigate(`/ai-planner/${newPlannerId}`);
      } else {
        fetchPlanners();
      }
    } catch (err) {
      console.error("Create error:", err);
      toast.error(err.response?.data?.message || "Failed to create roadmap. Check credit balance.");
    } finally {
      setCreating(false);
    }
  };

  const handleAdoptBlueprint = (blueprint) => {
    setFormData({
      goal: blueprint.title,
      company: blueprint.company,
      daysLeft: blueprint.daysLeft,
      dailyHours: blueprint.dailyHours,
      level: blueprint.level,
    });
    setCreateModalOpen(true);
  };

  // Filtered & Sorted Planners
  const filteredPlanners = useMemo(() => {
    return planners
      .filter((p) => {
        // Search query
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          (p.goal && p.goal.toLowerCase().includes(query)) ||
          (p.company && p.company.toLowerCase().includes(query)) ||
          (p.level && p.level.toLowerCase().includes(query));

        if (!matchesQuery) return false;

        // Tabs
        if (filterTab === "in-progress") return (p.progress || 0) < 100;
        if (filterTab === "completed") return (p.progress || 0) >= 100;
        if (filterTab === "calendar-synced") return !!p.syncedToCalendar;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "progress") {
          return (b.progress || 0) - (a.progress || 0);
        }
        if (sortBy === "days") {
          return (b.daysLeft || 0) - (a.daysLeft || 0);
        }
        // Default: newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [planners, searchQuery, filterTab, sortBy]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const totalRoadmaps = planners.length;
    const avgProgress = totalRoadmaps
      ? Math.round(planners.reduce((acc, p) => acc + (p.progress || 0), 0) / totalRoadmaps)
      : 0;
    const totalDaysPlanned = planners.reduce((acc, p) => acc + (p.daysLeft || 0), 0);
    const syncedCount = planners.filter((p) => p.syncedToCalendar).length;
    return { totalRoadmaps, avgProgress, totalDaysPlanned, syncedCount };
  }, [planners]);

  if (loading) {
    return (
      <div className="pt-20 lg:pl-64 p-6 bg-bg min-h-screen flex items-center justify-center text-text">
        <div className="text-center p-8 bg-surface border border-border rounded-2xl shadow-subtle max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-primary" />
          <h3 className="font-semibold text-sm text-text">Loading Roadmap Archives</h3>
          <p className="text-xs text-text-muted mt-1">Retrieving your AI study plans and milestones...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="pt-20 lg:pt-20 lg:pl-64 px-4 sm:px-6 md:px-8 pb-16 bg-bg min-h-screen text-text transition-colors duration-200">
        <main className="max-w-[1240px] mx-auto space-y-8">
          {/* HERO BANNER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface-2 to-surface border border-border p-6 sm:p-8 md:p-10 shadow-subtle">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold border border-primary/20 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse text-primary" />
                  <span>AI Career Roadmap Hub</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text leading-tight">
                  Placement Roadmaps &{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                    Study Sprints
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Track day-to-day milestones, auto-schedule revision sessions directly to Google Calendar,
                  and jumpstart preparation with curated SDE blueprints.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted bg-surface-2 px-2.5 py-1 rounded-md border border-border">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>Adaptive Milestones</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted bg-surface-2 px-2.5 py-1 rounded-md border border-border">
                    <CalendarCheck className="w-3.5 h-3.5 text-blue-500" />
                    <span>Google Calendar Auto-Sync</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-text-muted bg-surface-2 px-2.5 py-1 rounded-md border border-border">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Gamified XP Rewards</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
                <Button
                  onClick={() => {
                    setFormData({
                      goal: "",
                      company: "",
                      daysLeft: 30,
                      dailyHours: 3,
                      level: "intermediate",
                    });
                    setCreateModalOpen(true);
                  }}
                  className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold py-2.5 px-4 rounded-xl shadow-soft cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Create Custom Roadmap
                </Button>

                <a
                  href="#blueprints-section"
                  className="bg-surface-2 hover:bg-surface text-text border border-border hover:border-primary/40 text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <Compass className="w-3.5 h-3.5 text-primary" />
                  Explore Blueprints
                </a>
              </div>
            </div>

            {/* REAL-TIME STATS RIBBON */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-border">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-surface/80 border border-border/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-text-muted">Total Roadmaps</span>
                  <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-text">{stats.totalRoadmaps}</span>
                  <span className="text-[10px] text-text-muted">Saved plans</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-surface/80 border border-border/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-text-muted">Avg Completion</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-text">{stats.avgProgress}%</span>
                  <span className="text-[10px] text-text-muted">Overall progress</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-surface/80 border border-border/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-text-muted">Days Planned</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-text">{stats.totalDaysPlanned}</span>
                  <span className="text-[10px] text-text-muted">Total day span</span>
                </div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-surface/80 border border-border/80 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-text-muted">Google Calendar</span>
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      calendarStatus.authorized ? "bg-emerald-500 animate-pulse" : "bg-text-subtle"
                    }`}
                  />
                  <span className="text-sm font-bold text-text">
                    {calendarStatus.authorized ? "Connected" : "Not Linked"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GOOGLE CALENDAR SYNC CARD */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-subtle transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/15 via-red-500/10 to-yellow-500/15 border border-border flex items-center justify-center shrink-0 shadow-xs">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-text">
                      Google Calendar Auto-Sync
                    </h3>
                    {calendarStatus.authorized ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        <Check className="w-3 h-3" /> Active Link
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-2 text-text-muted border border-border text-[10px] font-semibold">
                        Ready to Connect
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
                    Auto-schedules daily problems, concept revision sessions, and mock interviews directly into
                    your Google Calendar with timed alerts on your phone.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
                {calendarStatus.loading ? (
                  <Button disabled variant="outline" className="text-xs">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
                    Checking Status...
                  </Button>
                ) : !calendarStatus.authorized ? (
                  <Button
                    onClick={handleGoogleOAuth}
                    className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-soft cursor-pointer flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Connect Google Calendar
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={syncAllPlanners}
                      disabled={syncingAll || planners.length === 0}
                      className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-soft cursor-pointer flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
                    >
                      {syncingAll ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Syncing All...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          Sync All Roadmaps ({planners.length})
                        </>
                      )}
                    </Button>
                    <button
                      onClick={handleGoogleOAuth}
                      className="text-xs text-text-muted hover:text-text px-3 py-1.5 rounded-lg border border-border hover:bg-surface-2 transition-colors cursor-pointer"
                    >
                      Reconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* USER'S SAVED ROADMAPS SECTION */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-text flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Your Active & Saved Roadmaps
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-soft text-primary border border-primary/20">
                    {filteredPlanners.length} of {planners.length}
                  </span>
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Resume active study tracks, monitor daily completion percentages, or sync with calendar.
                </p>
              </div>

              {/* SEARCH & FILTER CONTROLS */}
              {planners.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Search company or goal..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs bg-surface border-border rounded-lg"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-8 text-xs bg-surface text-text border border-border rounded-lg px-2.5 cursor-pointer outline-none focus:border-primary"
                  >
                    <option value="newest">Newest First</option>
                    <option value="progress">Highest Progress</option>
                    <option value="days">Timeline Length</option>
                  </select>
                </div>
              )}
            </div>

            {/* FILTER PILLS (IF SAVED PLANS EXIST) */}
            {planners.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label: `All Plans (${planners.length})` },
                  {
                    id: "in-progress",
                    label: `In Progress (${planners.filter((p) => (p.progress || 0) < 100).length})`,
                  },
                  {
                    id: "completed",
                    label: `Completed (${planners.filter((p) => (p.progress || 0) >= 100).length})`,
                  },
                  {
                    id: "calendar-synced",
                    label: `Synced to G-Cal (${planners.filter((p) => p.syncedToCalendar).length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      filterTab === tab.id
                        ? "bg-primary text-on-primary shadow-xs"
                        : "bg-surface text-text-muted hover:text-text border border-border hover:bg-surface-2"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* CARDS GRID OR EMPTY STATE */}
            {planners.length === 0 ? (
              <div className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-surface p-8 sm:p-12 text-center shadow-subtle">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-soft to-emerald-200/40 text-primary flex items-center justify-center shadow-inner">
                      <Compass className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-amber-500">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-text">
                      No Saved Roadmaps Yet
                    </h3>
                    <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                      You haven't generated any personalized preparation plans yet. Choose one of our
                      battle-tested industry blueprints below or generate a custom AI plan tailored to your target company!
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                      onClick={() => {
                        setFormData({
                          goal: "",
                          company: "",
                          daysLeft: 30,
                          dailyHours: 3,
                          level: "intermediate",
                        });
                        setCreateModalOpen(true);
                      }}
                      className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-soft cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Generate Your First Plan
                    </Button>

                    <a
                      href="#blueprints-section"
                      className="text-xs font-semibold text-text hover:text-primary px-4 py-2 rounded-xl border border-border bg-surface-2 hover:bg-surface transition-all w-full sm:w-auto text-center"
                    >
                      Browse Blueprints Below ↓
                    </a>
                  </div>
                </div>
              </div>
            ) : filteredPlanners.length === 0 ? (
              <div className="text-center p-8 bg-surface border border-border rounded-2xl shadow-subtle">
                <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-text">No matching roadmaps found</h4>
                <p className="text-xs text-text-muted mt-1">
                  Try adjusting your search query or switching active filter tabs.
                </p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterTab("all");
                  }}
                  className="mt-3 text-xs text-primary"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPlanners.map((p) => {
                  const progressValue = Math.min(100, Math.max(0, p.progress || 0));
                  const isCompleted = progressValue >= 100;
                  const companyInitials = (p.company || "GEN")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .substring(0, 3)
                    .toUpperCase();

                  return (
                    <div
                      key={p._id}
                      className="group relative bg-surface border border-border rounded-2xl p-5 shadow-subtle hover:border-primary/50 hover:shadow-soft transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Top Badges & Options */}
                      <div className="space-y-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Company Monogram Badge */}
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-soft to-surface-2 text-primary font-bold text-xs flex items-center justify-center border border-border shrink-0 shadow-xs">
                              {companyInitials}
                            </div>
                            <div className="min-w-0">
                              <span className="text-[11px] font-semibold text-text-muted block truncate">
                                {p.company || "General Tech SDE"}
                              </span>
                              <span className="text-[10px] text-text-subtle">
                                {p.createdAt
                                  ? new Date(p.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })
                                  : "Recently created"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize border ${
                                p.level === "advanced"
                                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                  : p.level === "intermediate"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {p.level || "Beginner"}
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setPlannerToDelete(p);
                                setDeleteModalOpen(true);
                              }}
                              className="text-text-subtle hover:text-danger p-1 rounded-md hover:bg-danger-soft transition-colors cursor-pointer"
                              title="Delete Roadmap"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <div>
                          <h3
                            onClick={() => navigate(`/ai-planner/${p._id}`)}
                            className="font-bold text-sm text-text line-clamp-2 group-hover:text-primary transition-colors cursor-pointer leading-snug"
                          >
                            {p.goal}
                          </h3>
                        </div>

                        {/* Progress Bar & Day Status */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-text-muted flex items-center gap-1">
                              <Target className="w-3 h-3 text-primary" />
                              Day {p.currentDay || 1} of {p.daysLeft || 30}
                            </span>
                            <span className="font-bold text-text">{progressValue}%</span>
                          </div>

                          <div className="w-full bg-surface-2 rounded-full h-2 overflow-hidden border border-border/50">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isCompleted
                                  ? "bg-emerald-500"
                                  : "bg-gradient-to-r from-primary to-emerald-400"
                              }`}
                              style={{ width: `${progressValue}%` }}
                            />
                          </div>
                        </div>

                        {/* Key Info Pills */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="flex items-center gap-1.5 text-text-muted bg-surface-2/60 p-2 rounded-lg border border-border/60">
                            <Clock className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                            <span className="truncate">{p.daysLeft} days timeline</span>
                          </div>

                          <div className="flex items-center gap-1.5 text-text-muted bg-surface-2/60 p-2 rounded-lg border border-border/60">
                            <Timer className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                            <span className="truncate">{p.dailyHours || 3} hrs / day</span>
                          </div>
                        </div>

                        {/* Google Calendar Sync Status Pill */}
                        <div className="text-[11px] flex items-center justify-between text-text-subtle pt-0.5">
                          {p.syncedToCalendar ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CalendarCheck className="w-3 h-3" />
                              Synced with G-Calendar
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-muted">
                              Not yet synced to calendar
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border">
                        <Button
                          onClick={() => navigate(`/ai-planner/${p._id}`)}
                          className="flex-1 bg-primary hover:bg-primary-hover text-on-primary py-2 h-9 rounded-xl text-xs font-semibold shadow-soft cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Roadmap</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                        </Button>

                        {calendarStatus.authorized && (
                          <Button
                            variant="outline"
                            onClick={() => syncPlannerToCalendar(p._id)}
                            disabled={syncing[p._id]}
                            className="h-9 px-3 bg-surface hover:bg-surface-2 border-border text-text rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                            title="Sync roadmap tasks to Google Calendar"
                          >
                            {syncing[p._id] ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                            ) : (
                              <Calendar className="w-3.5 h-3.5 text-text-muted" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CURATED SDE ROADMAP BLUEPRINTS */}
          <div id="blueprints-section" className="space-y-4 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-border">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Curated by Top Placements</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-text">
                  Industry-Standard Career Blueprints
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  Pre-configured, battle-tested learning roadmaps. Adopt with 1-click or customize for your timeline.
                </p>
              </div>

              <Badge variant="outline" className="text-xs bg-surface-2 font-medium">
                4 Available Tracks
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {CURATED_BLUEPRINTS.map((bp) => (
                <div
                  key={bp.id}
                  className={`relative overflow-hidden rounded-2xl bg-surface border border-border p-6 shadow-subtle hover:shadow-soft transition-all duration-300 flex flex-col justify-between space-y-5 ${bp.borderAccent}`}
                >
                  {/* Subtle Gradient Backdrop */}
                  <div
                    className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-bl ${bp.gradient} rounded-full blur-2xl pointer-events-none`}
                  />

                  <div className="space-y-3.5 relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${bp.badgeColor}`}
                        >
                          {bp.badge}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-text mt-2 leading-tight">
                          {bp.title}
                        </h3>
                        <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-text-subtle" />
                          <span>Target: {bp.company}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 inline-flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {bp.totalXP} XP
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-text-muted leading-relaxed">
                      {bp.description}
                    </p>

                    {/* Meta stats */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-text-muted">
                      <div className="flex items-center gap-1 bg-surface-2 px-2.5 py-1 rounded-md border border-border">
                        <Clock className="w-3 h-3 text-text-subtle" />
                        <span>{bp.daysLeft} Days</span>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-2 px-2.5 py-1 rounded-md border border-border">
                        <Timer className="w-3 h-3 text-text-subtle" />
                        <span>{bp.dailyHours} hrs / day</span>
                      </div>
                      <div className="flex items-center gap-1 bg-surface-2 px-2.5 py-1 rounded-md border border-border capitalize">
                        <Zap className="w-3 h-3 text-primary" />
                        <span>{bp.level} level</span>
                      </div>
                    </div>

                    {/* Topics Pill List */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider">
                        Core Syllabus Highlights
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {bp.topics.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium bg-surface-2/80 text-text-muted px-2 py-0.5 rounded-md border border-border/80"
                          >
                            • {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative z-10 pt-3 border-t border-border flex items-center gap-2">
                    <Button
                      onClick={() => handleAdoptBlueprint(bp)}
                      className="flex-1 bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold py-2 rounded-xl shadow-soft cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Adopt This Blueprint
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate("/ai-planner")}
                      className="text-xs font-medium text-text bg-surface hover:bg-surface-2 border-border rounded-xl cursor-pointer"
                      title="Customize in full editor"
                    >
                      Customize
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROADMAP HOW IT WORKS TIPS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-xs font-bold text-text">AI Tailors Every Day</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Gemini AI structures your entire journey with direct LeetCode problem links, video lectures, and revision milestones.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-xs font-bold text-text">Sync with Google Calendar</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Connect your Google account to automatically push scheduled study blocks right into your calendar with push notifications.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-xs font-bold text-text">Earn XP & Climb Ranks</h4>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Every completed task awards placement points that reflect in your daily streak and the student leaderboard.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* QUICK ROADMAP CREATION MODAL */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md w-full bg-surface border-border text-text p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-text flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Generate AI Study Roadmap
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold text-text">
                Target Role / Goal <span className="text-danger">*</span>
              </Label>
              <Input
                type="text"
                required
                placeholder="e.g. SDE-1, Full-Stack Developer, Data Analyst"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="mt-1 h-9 text-xs bg-surface-2 border-border rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-text">Target Company</Label>
              <Input
                type="text"
                placeholder="e.g. Google, Microsoft, TCS, Startup"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="mt-1 h-9 text-xs bg-surface-2 border-border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-text">Timeline (Days)</Label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {[15, 30, 45].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setFormData({ ...formData, daysLeft: d })}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formData.daysLeft === d
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-2 text-text-muted border-border hover:text-text"
                      }`}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-text">Daily Focus</Label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {[2, 3, 4].map((h) => (
                    <button
                      type="button"
                      key={h}
                      onClick={() => setFormData({ ...formData, dailyHours: h })}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formData.dailyHours === h
                          ? "bg-primary text-on-primary border-primary"
                          : "bg-surface-2 text-text-muted border-border hover:text-text"
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-text">Current Skill Level</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { id: "beginner", label: "Beginner" },
                  { id: "intermediate", label: "Intermediate" },
                  { id: "advanced", label: "Advanced" },
                ].map((lvl) => (
                  <button
                    type="button"
                    key={lvl.id}
                    onClick={() => setFormData({ ...formData, level: lvl.id })}
                    className={`py-1.5 rounded-lg text-xs font-semibold border capitalize transition-all cursor-pointer ${
                      formData.level === lvl.id
                        ? "bg-primary text-on-primary border-primary"
                        : "bg-surface-2 text-text-muted border-border hover:text-text"
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-2 border border-border text-[11px] text-text-muted flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Uses 30 AI credits to curate day-by-day video & coding tasks.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creating}
                className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold rounded-xl px-4 py-2"
              >
                {creating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate AI Plan
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-sm w-full bg-surface border-border text-text p-6 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-text flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              Delete Roadmap?
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-text-muted mt-2 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-text">
              "{plannerToDelete?.goal || "this roadmap"}"
            </span>
            ? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeletePlanner}
              disabled={deleting}
              className="bg-danger hover:bg-danger/90 text-white text-xs font-semibold rounded-xl px-4 py-2"
            >
              {deleting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Yes, Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
}
