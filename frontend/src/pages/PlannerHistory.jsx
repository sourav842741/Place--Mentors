import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Eye, Sparkles, Clock, CheckCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "../services/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PlannerHistory() {
  const navigate = useNavigate();
  const [planners, setPlanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarStatus, setCalendarStatus] = useState({
    authorized: false,
    loading: true,
  });
  const [syncing, setSyncing] = useState({});

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
  }, []);

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
      window.location.href = res.data.authUrl;
    } catch (err) {
      alert("Failed to get auth URL");
    }
  };

  const syncPlannerToCalendar = async (plannerId) => {
    if (!planners.length) {
      alert("No planners available");
      return;
    }
    setSyncing((prev) => ({ ...prev, [plannerId]: true }));
    try {
      const res = await api.post("/api/planner/calendar", { plannerId }, { withCredentials: true });
      alert(`Synced ${res.data.syncedCount} new events!`);
    } catch (err) {
      console.error("Sync error:", err.response?.data);
      alert(err.response?.data?.message || "Sync failed. Check server logs.");
    } finally {
      setSyncing((prev) => ({ ...prev, [plannerId]: false }));
    }
  };

  const viewPlanner = (plannerId) => {
    navigate(`/ai-planner/${plannerId}`);
  };

  if (loading) {
    return (
      <div className="pt-20 lg:pl-64 p-6 bg-bg min-h-screen flex items-center justify-center text-text">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-xs text-text-muted">Loading your planner archives...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 bg-bg min-h-screen text-text transition-colors duration-200">
        <main className="max-w-[1200px] mx-auto space-y-6">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-border">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
                Planner History
              </h1>
              <p className="text-xs text-text-muted mt-1">
                View previous AI study roadmaps and track milestone progress.
              </p>
            </div>

            <Button
              onClick={() => navigate("/ai-planner")}
              className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium rounded-lg shadow-soft cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate New Plan
            </Button>
          </div>

          {/* GOOGLE CONNECT */}
          {calendarStatus.loading ? (
            <div className="p-3.5 bg-surface border border-border rounded-xl">
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Google Calendar sync status...</span>
              </div>
            </div>
          ) : !calendarStatus.authorized ? (
            <div className="p-4 bg-surface border border-border rounded-xl shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-text">Sync with Google Calendar</h4>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Automatically add daily tasks and revision reminders into your Google Calendar.
                </p>
              </div>

              <Button
                onClick={handleGoogleOAuth}
                className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium rounded-lg shadow-soft cursor-pointer shrink-0"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                Connect Calendar
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-success-soft text-success text-xs font-medium border border-success/20 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Google Calendar is connected and synced.</span>
            </div>
          )}

          {/* EMPTY */}
          {planners.length === 0 ? (
            <div className="text-center p-12 max-w-md mx-auto bg-surface border border-border rounded-xl shadow-subtle space-y-4">
              <Sparkles className="w-10 h-10 text-text-subtle mx-auto" />
              <div>
                <h3 className="text-base font-bold text-text">No Saved Planners</h3>
                <p className="text-xs text-text-muted mt-1">
                  You haven't generated any AI roadmaps yet.
                </p>
              </div>
              <Button
                onClick={() => navigate("/ai-planner")}
                className="bg-primary hover:bg-primary-hover text-on-primary text-xs font-medium rounded-lg shadow-soft cursor-pointer"
              >
                Create Your First Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {planners.map((p) => (
                <div
                  key={p._id}
                  className="bg-surface border border-border rounded-xl p-5 shadow-subtle hover:border-primary/40 transition-colors flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-text line-clamp-1">
                        {p.goal}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-surface-2 text-text-muted border border-border shrink-0">
                        {p.company || "General"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-text-muted">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-text-subtle" />
                        <span>{p.daysLeft} days timeline</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-subtle text-[11px]">Created:</span>
                        <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-primary" />
                        <span className="font-medium text-text">{p.progress || 0}% completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => viewPlanner(p._id)}
                      className="flex-1 bg-primary hover:bg-primary-hover text-on-primary py-2 rounded-lg text-xs font-semibold transition-colors shadow-soft flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Roadmap
                    </button>

                    {calendarStatus.authorized && (
                      <button
                        type="button"
                        onClick={() => syncPlannerToCalendar(p._id)}
                        disabled={syncing[p._id]}
                        className="p-2 bg-surface-2 hover:bg-surface border border-border text-text rounded-lg text-xs transition-colors cursor-pointer"
                        title="Sync to Google Calendar"
                      >
                        {syncing[p._id] ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Calendar className="w-3.5 h-3.5 text-text-muted" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}
