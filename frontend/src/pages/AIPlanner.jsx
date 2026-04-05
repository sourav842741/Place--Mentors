import React, { useState, useEffect, useCallback } from "react";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Play,
  Calendar,
  Lock,
  CheckCircle,
  BookOpen,
  Code,
  RefreshCw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import api from "../services/api";
import useAuth from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

export default function AIPlanner() {
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const { id } = useParams();

  // State
  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    goal: "",
    company: "",
    daysLeft: 30,
    dailyHours: 4,
    level: "beginner",
  });
  const [showForm, setShowForm] = useState(false);
  const [syncModal, setSyncModal] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState({
    authorized: false,
    loading: true,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTask, setUpdatingTask] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Auto-clear success message
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Load planner
  const fetchPlanner = useCallback(async (plannerId = null) => {
    try {
      const url = plannerId ? `/api/planner/${plannerId}` : "/api/planner/my";
      const res = await api.get(url, { withCredentials: true });
      if (!res.data?.plan)
        throw new Error("Invalid planner data - no plan array");
      setPlanner(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    // Check for Google Calendar success param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("calendar") === "connected") {
      setSuccessMsg(" Google Calendar connected successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        if (id) {
          await fetchPlanner(id);
        } else {
          await fetchPlanner();
        }
      } catch (err) {
        setError(id ? "Plan not found" : "No active plan");
      } finally {
        setIsLoading(false);
      }

      // Load calendar status
      try {
        const res = await api.get("/api/planner/calendar/status", {
          withCredentials: true,
        });
        setCalendarStatus({ ...res.data, loading: false });
      } catch (err) {
        setCalendarStatus({ authorized: false, loading: false });
      }
    };
    loadData();
  }, [user?._id, id, fetchPlanner]);

  const handleGoogleOAuth = async () => {
    try {
      const res = await api.get("/api/planner/calendar/auth", {
        withCredentials: true,
      });
      window.location.href = res.data.authUrl;
    } catch (err) {
      alert("Failed to get auth URL");
    }
  };

  const handleCreatePlanner = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await api.post("/api/planner/create", formData, {
        withCredentials: true,
      });
      navigate(`/ai-planner/${res.data.plannerId}`);
      setShowForm(false);
      setFormData({
        goal: "",
        company: "",
        daysLeft: 30,
        dailyHours: 4,
        level: "beginner",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating planner");
    }
    setCreating(false);
  };

  const handleCompleteTask = async (dayIdx, taskIdx) => {
    if (updatingTask?.dayIdx === dayIdx && updatingTask?.taskIdx === taskIdx)
      return;

    setUpdatingTask({ dayIdx, taskIdx });

    // Optimistic update
    setPlanner((prev) => {
      if (!prev) return prev;
      const newPlanner = JSON.parse(JSON.stringify(prev));
      newPlanner.plan[dayIdx].tasks[taskIdx].completed = true;
      const totalTasks = newPlanner.plan.reduce(
        (acc, d) => acc + d.tasks.length,
        0,
      );
      const completedTasks = newPlanner.plan.reduce(
        (acc, d) => acc + d.tasks.filter((t) => t.completed).length,
        0,
      );
      newPlanner.progress = Math.round((completedTasks / totalTasks) * 100);
      return newPlanner;
    });

    try {
      await api.post(
        "/api/planner/complete",
        {
          dayIndex: dayIdx,
          taskIndex: taskIdx,
        },
        { withCredentials: true },
      );
      await fetchPlanner(planner._id);
      setSuccessMsg(" Task completed!");
    } catch (err) {
      await fetchPlanner(planner._id);
      console.error("Complete error:", err.response?.data || err.message);
      setSuccessMsg(" Completion failed");
    } finally {
      setUpdatingTask(null);
    }
  };

  const syncToCalendar = async () => {
    if (!planner || !user) {
      alert("Please create a planner and connect Google Calendar first");
      setSyncModal(false);
      return;
    }
    try {
      const res = await api.post(
        "/api/planner/calendar",
        { plannerId: planner._id },
        { withCredentials: true },
      );
      alert(` Synced ${res.data.syncedCount} new events to Google Calendar!`);
      setSyncModal(false);
    } catch (err) {
      console.error("Sync error:", err.response?.data);
      alert(
        err.response?.data?.message ||
          "Sync failed. Check console for details.",
      );
    }
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  if (isLoading)
    return (
      <div className="pt-16 md:pl-64 p-4 md:p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg">Loading your plan...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="pt-16 md:pl-64 p-4 md:p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Error</h3>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <>
      <Navbar />

      <div className="pt-16 md:pl-64 p-4 md:p-6 bg-gray-100 min-h-screen mt-17">
        <main className="flex-1">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 lg:gap-0">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AI Mentor Planner <Sparkles className="inline ml-2" />
                </h1>
                <p className="text-gray-600 mt-2">
                  Your personalized daily roadmap
                </p>
              </div>
              {/* <Button
                onClick={() => setShowForm(true)}
                size="lg"
                variant={planner ? "outline" : "default"}
                className={`
                  ${
                    planner
                      ? "border-gray-300 hover:bg-gray-50"
                      : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  }
                `}
              >
                <Play className="mr-2" />{" "}
                {planner ? "Create New Plan" : "Create Plan"}
              </Button> */}
              {planner && (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Creating new plan keeps old plans in History ✓
                </div>
              )}
            </div>

            {/* Create Form Modal */}
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Your Study Plan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreatePlanner} className="space-y-4">
                  <div>
                    <Label>Goal</Label>
                    <Input
                      placeholder="Crack FAANG interviews"
                      value={formData.goal}
                      onChange={(e) =>
                        setFormData({ ...formData, goal: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Target Company</Label>
                      <Input
                        placeholder="Google"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Days Left</Label>
                      <Input
                        type="number"
                        min="7"
                        max="90"
                        value={formData.daysLeft}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            daysLeft: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Daily Hours</Label>
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.dailyHours}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dailyHours: Number(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label>Level</Label>
                      <select
                        value={formData.level}
                        onChange={(e) =>
                          setFormData({ ...formData, level: e.target.value })
                        }
                        className="p-3 border rounded-lg"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={creating}>
                    {creating ? (
                      <RefreshCw className="animate-spin mr-2" />
                    ) : (
                      <Sparkles className="mr-2" />
                    )}{" "}
                    Generate Mentor Plan (30 credits)
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Planner Display */}
            {planner ? (
              id ? (
                //  DETAIL VIEW 
                <div className="space-y-10">
                  {planner.plan.map((day, dayIdx) => {
                    const isCurrent = planner.currentDay === day.day;

                    return (
                      <div key={dayIdx} className="space-y-4">
                        {/* DAY TITLE */}
                        <h2 className="text-2xl font-bold">
                          Day {day.day}: {day.title}
                        </h2>

                        {/* BIG VIDEO */}
                        {/* {day.tasks.find(t => t.videoUrl)?.videoUrl && (
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <iframe
                  src={day.tasks
                    .find(t => t.videoUrl)
                    .videoUrl.replace("watch?v=", "embed/")}
                  className="w-full h-[350px] md:h-[450px]"
                  allowFullScreen
                />
              </div>
            )} */}

                        {/* TASKS */}
                        <div className="space-y-4">
                          {day.tasks.map((task, taskIdx) => (
                            <div
                              key={taskIdx}
                              className={`p-4 rounded-xl border ${
                                isCurrent ? "bg-white shadow-md" : "bg-gray-50"
                              }`}
                            >
                              {/* TITLE */}
                              <h4 className="font-semibold text-lg">
                                {task.title}
                              </h4>

                              {/* TYPE */}
                              <p className="text-xs text-blue-600 font-medium uppercase">
                                {task.type}
                              </p>

                              {/* DESCRIPTION */}
                              <p className="text-sm text-gray-600 mt-1">
                                {task.explanation || "No explanation"}
                              </p>

                              {/* META */}
                              <div className="text-xs text-gray-500 mt-2 flex gap-2 flex-wrap">
                                <span>⏰ {task.time}</span>
                                <span>•</span>
                                <span>{task.difficulty}</span>

                                {task.platform && (
                                  <>
                                    <span>•</span>
                                    <span>{task.platform}</span>
                                  </>
                                )}
                              </div>

                              {/* 🔗 RESOURCE LINK */}
                              {task.link && (
                                <a
                                  href={task.link}
                                  target="_blank"
                                  className="text-blue-500 text-sm underline mt-2 inline-block"
                                >
                                  Open Resource
                                </a>
                              )}

                              {/* 🔍 YOUTUBE SEARCH */}
                              {task.youtubeQuery && (
                                <p className="text-xs text-gray-400 mt-1">
                                  🔍 {task.youtubeQuery}
                                </p>
                              )}

                              {/* 🎥 VIDEO */}
                              {task.videoUrl && (
                                <iframe
                                  src={task.videoUrl.replace(
                                    "watch?v=",
                                    "embed/",
                                  )}
                                  className="w-full h-75 md:h-100 mt-3 rounded-xl"
                                />
                              )}

                              {/* ✅ COMPLETE */}
                              <div className="mt-3 flex justify-end">
                                {task.completed ? (
                                  <span className="text-green-500 text-sm">
                                    Completed
                                  </span>
                                ) : (
                                  <input
                                    type="checkbox"
                                    onChange={() =>
                                      handleCompleteTask(dayIdx, taskIdx)
                                    }
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // 🟡 SIMPLE VIEW (without id)
                <div className="flex flex-col items-center justify-center text-center py-20">
                  {/* ICON */}
                  <div className="bg-linear-to-r from-purple-100 to-blue-100 p-6 rounded-full mb-6 shadow-inner">
                    <Sparkles className="w-12 h-12 text-purple-600" />
                  </div>

                  {/* TITLE */}
                  <h2 className="text-3xl font-bold mb-3">Magic Start</h2>

                  {/* DESCRIPTION */}
                  <p className="text-gray-500 max-w-md mb-8">
                    Start your journey with a personalized AI mentor plan. Get
                    daily tasks, videos, and roadmap tailored for your goal 🚀
                  </p>

                  {/* BUTTON */}
                    <Button
                onClick={() => setShowForm(true)}
                size="lg"
                variant={planner ? "outline" : "default"}
                className={`
                  ${
                    planner
                      ? "border-gray-300 hover:bg-gray-50"
                      : "bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  }
                `}
              >
                <Play className="mr-2" />{" "}
                {planner ? "Create New Plan" : "Create Plan"}
              </Button>
                </div>
              )
            ) : (
              <Card className="text-center p-12">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">No Planner Yet</h3>
                <p className="text-gray-500 mb-6">
                  Create your personalized mentor roadmap
                </p>
                <Button onClick={() => setShowForm(true)} size="lg">
                  Create New Plan (30 credits)
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
