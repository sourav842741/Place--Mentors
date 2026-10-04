import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Mic, MicOff, Clock, Phone, Award, BadgeCheck, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fetchVoiceHistory } from "../redux/voiceSlice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CallHistory = () => {
  const dispatch = useDispatch();
  const { loading, entities: history } = useSelector((state) => state.voice);

  const calls = history ? Object.values(history) : [];

  useEffect(() => {
    dispatch(fetchVoiceHistory());
  }, [dispatch]);

  const getModeIcon = (mode) => {
    const icons = {
      "hr-interview": Phone,
      "spoken-english": Mic,
      motivation: Award,
      "resume-screening": BadgeCheck,
    };
    const Icon = icons[mode];
    return Icon ? <Icon className="w-4 h-4 text-primary" /> : <Mic className="w-4 h-4 text-primary" />;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text flex items-center justify-center">
          <div className="text-center py-20">
            <div className="w-9 h-9 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-text-muted">Loading call history...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-surface border border-border rounded-xl p-5 md:p-6 shadow-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                Voice Coach History
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                Total completed sessions: <span className="font-semibold text-text">{calls.length}</span>
              </p>
            </div>
            <Link to="/ai-voice-coach">
              <Button
                size="sm"
                className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Voice Session
              </Button>
            </Link>
          </div>

          {/* Table */}
          <div className="bg-surface border border-border rounded-xl shadow-subtle overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-surface-2/60">
                    <TableHead className="text-xs font-semibold text-text-muted">Mode</TableHead>
                    <TableHead className="text-xs font-semibold text-text-muted">Date & Time</TableHead>
                    <TableHead className="text-xs font-semibold text-text-muted">Phone</TableHead>
                    <TableHead className="text-xs font-semibold text-text-muted">Duration</TableHead>
                    <TableHead className="text-xs font-semibold text-text-muted">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-text-muted">Score</TableHead>
                    <TableHead className="text-right text-xs font-semibold text-text-muted">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calls.map((call) => (
                    <TableRow
                      key={call._id}
                      className="border-b border-border/50 hover:bg-surface-2/40 transition-colors"
                    >
                      <TableCell className="font-medium text-xs flex items-center gap-2 text-text">
                        {getModeIcon(call.mode)}
                        <span>
                          {call.mode.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-text-muted">
                        {new Date(call.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-text-muted">{call.phone}</TableCell>
                      <TableCell>
                        <span className="text-xs font-mono text-text">
                          {formatDuration(call.duration || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            call.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : call.status === "active"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-surface-2 text-text-muted border border-border"
                          }`}
                        >
                          {call.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {call.score > 0 ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-surface-2 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(call.score, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-text">{call.score}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-text-subtle">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/voice-report/${call._id}`}
                          className="text-primary hover:text-primary-hover font-medium text-xs inline-flex items-center gap-1 hover:underline"
                        >
                          View Report
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {calls.length === 0 && (
                <div className="p-16 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center text-primary mx-auto mb-3">
                    <MicOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-text mb-1">
                    No voice call history yet
                  </h3>
                  <p className="text-xs text-text-muted mb-5 max-w-sm mx-auto">
                    Start your first live HR mock interview or spoken English practice call to see analytics.
                  </p>
                  <Link to="/ai-voice-coach">
                    <Button size="sm" className="bg-primary hover:bg-primary-hover text-white text-xs font-semibold">
                      <Mic className="w-4 h-4 mr-1.5" />
                      Start First Call
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CallHistory;
