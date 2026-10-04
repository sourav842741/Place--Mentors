import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
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
  ArrowRight,
  ExternalLink,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    daysLeft: 14,
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

      if (!res.data) {
        setPlanner(null);
        return;
      }

      setPlanner(res.data);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err.message);
      setPlanner(null);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("calendar") === "connected") {
      setSuccessMsg("Google Calendar connected successfully!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        await fetchPlanner(id);
      } catch (err) {
        setError("Failed to load planner data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, id, fetchPlanner]);

  const handleCreatePlanner = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const res = await api.post("/api/planner/create", formData, {
        withCredentials: true,
      });
      setPlanner(res.data);
      setShowForm(false);
      setSuccessMsg("Roadmap generated successfully!");
      navigate(`/ai-planner/${res.data._id}`);
    } catch (err) {
      console.error("Create error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to create planner");
    } finally {
      setCreating(false);
    }
  };

  const handleCompleteTask = async (dayIdx, taskIdx) => {
    if (!planner) return;
    setUpdatingTask(`${dayIdx}-${taskIdx}`);

    try {
      const res = await api.post(
        "/api/planner/complete",
        {
          plannerId: planner._id,
          dayIndex: dayIdx,
          taskIndex: taskIdx,
        },
        { withCredentials: true }
      );
      const updatedPlanner = res.data?.planner || res.data;
      setPlanner(updatedPlanner);
      toast.success("Task completed! XP added 🎉");
    } catch (err) {
      console.error("Update task error:", err.response?.data);
      toast.error(err.response?.data?.message || "Failed to update task status");
    } finally {
      setUpdatingTask(null);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg text-text text-sm">
        Loading...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pt-20 lg:pl-64 p-6 bg-bg min-h-screen flex items-center justify-center text-text">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-sm text-text-muted">Loading your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 lg:pl-64 p-6 bg-bg min-h-screen flex items-center justify-center text-text">
        <div className="max-w-md w-full bg-surface border border-border p-6 rounded-xl text-center shadow-subtle">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
          <h3 className="text-base font-bold text-text mb-1">Notice</h3>
          <p className="text-xs text-text-muted mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary-hover text-on-primary text-xs rounded-lg"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 bg-bg min-h-screen text-text transition-colors duration-200">
        <main className="max-w-[1200px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-soft text-primary text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                AI Career Roadmap
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
                Personalized Placement Roadmap
              </h1>
              <p className="text-xs text-text-muted mt-1">
                Structured day-by-day plan tailored to your target company & preparation timeline.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/planner-history")}
                variant="outline"
                className="bg-surface border-border text-text hover:bg-surface-2 text-xs rounded-lg cursor-pointer h-9"
              >
                Plan History
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium rounded-lg shadow-soft cursor-pointer h-9 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {planner ? "New Plan" : "Create Plan"}
              </Button>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-lg bg-success-soft text-success text-xs font-medium border border-success/20 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Create Form Modal */}
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogContent className="max-w-xl bg-surface border-border text-text">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-text">
                  Generate Your Placement Roadmap
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreatePlanner} className="space-y-4 pt-2">
                <div>
                  <Label className="text-xs font-medium text-text">Target Goal / Role</Label>
                  <Input
                    placeholder="e.g. SDE 1, Frontend Specialist, Data Analyst"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    required
                    className="mt-1 text-xs bg-surface border-border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-text">Target Company</Label>
                    <Input
                      placeholder="e.g. Google, Amazon, TCS"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="mt-1 text-xs bg-surface border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-text">Days Left</Label>
                    <Input
                      type="number"
                      min="2"
                      max="60"
                      value={formData.daysLeft}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          daysLeft: Number(e.target.value),
                        })
                      }
                      required
                      className="mt-1 text-xs bg-surface border-border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-medium text-text">Daily Study Hours</Label>
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
                      className="mt-1 text-xs bg-surface border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-text">Preparation Level</Label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs bg-surface border border-border rounded-lg text-text focus:outline-none focus:border-primary"
                    >
                      <option value="beginner">Beginner (Foundations first)</option>
                      <option value="intermediate">Intermediate (Problem solving & System design)</option>
                      <option value="advanced">Advanced (Mock interviews & Hard DSA)</option>
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-on-primary rounded-lg text-xs font-semibold py-2.5 mt-2 cursor-pointer"
                  disabled={creating}
                >
                  {creating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                  )}
                  Generate Plan (30 credits)
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Planner Display */}
          {planner ? (
            id ? (
              /* DETAIL VIEW */
              <div className="space-y-6">
                <div className="bg-surface border border-border rounded-xl p-5 shadow-subtle flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                      Active Roadmap
                    </span>
                    <h2 className="text-xl font-bold text-text mt-0.5">
                      {planner.goal} {planner.company && `• ${planner.company}`}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {planner.daysLeft} days schedule
                      </span>
                      <span>•</span>
                      <span>{planner.dailyHours || 4} hrs/day</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowForm(true)}
                    variant="outline"
                    className="text-xs border-border bg-surface-2 text-text hover:bg-surface rounded-lg cursor-pointer h-9"
                  >
                    Generate Another Plan
                  </Button>
                </div>

                {planner.plan?.map((day, dayIdx) => {
                  const isCurrent = planner.currentDay === day.day;

                  return (
                    <div
                      key={dayIdx}
                      className="bg-surface border border-border rounded-xl shadow-subtle overflow-hidden"
                    >
                      <div className="p-4 bg-surface-2/60 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-sm text-text flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-primary-soft text-primary font-bold flex items-center justify-center text-xs">
                            {day.day}
                          </span>
                          <span>Day {day.day}: {day.title}</span>
                        </h3>
                        {isCurrent && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/20">
                            Current Focus
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        {day.tasks?.map((task, taskIdx) => (
                          <div
                            key={taskIdx}
                            className="p-3.5 rounded-lg border border-border bg-surface hover:border-primary/40 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary-soft text-primary uppercase">
                                  {task.type}
                                </span>
                                <h4 className="font-semibold text-xs text-text">
                                  {task.title}
                                </h4>
                              </div>

                              <p className="text-xs text-text-muted leading-relaxed">
                                {task.explanation || task.desc || "Complete this target problem / reading."}
                              </p>

                              <div className="flex items-center gap-3 text-[11px] text-text-subtle pt-1">
                                <span>⏰ {task.time || "45m"}</span>
                                {task.difficulty && <span>• {task.difficulty}</span>}
                                {task.platform && <span>• {task.platform}</span>}
                                {task.link && (
                                  <a
                                    href={task.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center gap-1 font-medium"
                                  >
                                    Resource <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2">
                              {task.completed ? (
                                <span className="text-xs font-semibold text-success inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success-soft border border-success/20">
                                  <CheckCircle className="w-3.5 h-3.5" /> Done
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={updatingTask === `${dayIdx}-${taskIdx}`}
                                  onClick={() => handleCompleteTask(dayIdx, taskIdx)}
                                  className="text-xs px-3 py-1.5 rounded-lg border border-border bg-surface-2 text-text hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  {updatingTask === `${dayIdx}-${taskIdx}` ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Mark Complete"
                                  )}
                                </button>
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
              /* SIMPLE OVERVIEW */
              <div className="bg-surface border border-border rounded-xl p-10 text-center shadow-subtle space-y-4 max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-text">Personalized AI Roadmap</h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  Start your focused preparation path. Receive day-by-day practice tasks, video concepts, and interview milestones.
                </p>
                <div className="pt-2">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold px-5 py-2.5 rounded-lg cursor-pointer shadow-soft"
                  >
                    <Play className="w-3.5 h-3.5 mr-2" />
                    Configure New Plan
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="bg-surface border border-border rounded-xl p-12 text-center shadow-subtle space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-xl bg-surface-2 text-text-subtle flex items-center justify-center mx-auto border border-border">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-text">No Planner Active</h3>
              <p className="text-xs text-text-muted">
                Create a customized day-by-day roadmap tailored to your target company and exam dates.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold px-5 py-2.5 rounded-lg cursor-pointer"
              >
                Create Roadmap (30 credits)
              </Button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}
