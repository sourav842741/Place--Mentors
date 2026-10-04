import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Mic,
  Clock,
  Award,
  Target,
  BarChart3,
  Download,
  Share2,
  MicOff,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "../components/Navbar";
import { fetchVoiceReport } from "../redux/voiceSlice";

const CallReport = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentCall: report, reportLoading } = useSelector((state) => state.voice);

  useEffect(() => {
    if (id) {
      dispatch(fetchVoiceReport(id));
    }
  }, [id, dispatch]);

  if (reportLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text flex items-center justify-center">
          <Card className="w-full max-w-md bg-surface border border-border rounded-xl shadow-subtle">
            <CardContent className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-primary-soft border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-text-muted">Loading voice report...</p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <Navbar />
        <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text flex items-center justify-center">
          <Card className="w-full max-w-md bg-surface border border-border rounded-xl shadow-subtle">
            <CardContent className="p-8 text-center">
              <MicOff className="w-10 h-10 text-text-muted/50 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-text mb-1">Report not found</h3>
              <p className="text-xs text-text-muted mb-5">We couldn't locate this call session.</p>
              <Link
                to="/ai-voice-coach"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-on-primary px-4 py-2.5 rounded-lg text-xs font-semibold shadow-soft transition-colors"
              >
                <Mic className="w-4 h-4" />
                New Practice Call
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <>
      <Navbar />
      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* HEADER */}
          <div className="bg-surface border border-border rounded-xl shadow-subtle p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-text">
                    {report.mode?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </h1>
                  <div className="flex items-center gap-4 text-xs text-text-muted mt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDuration(report.duration || 0)}</span>
                    </div>
                    {report.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{report.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Badge variant="outline" className="text-xs px-3 py-1 bg-accent-soft text-accent border border-accent/20 font-semibold rounded-full">
                  {report.status?.toUpperCase() || "COMPLETED"}
                </Badge>
                {report.score > 0 && (
                  <div className="bg-primary-soft text-primary border border-primary/20 px-3.5 py-1 rounded-lg font-bold text-sm">
                    {report.score}/100
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SCORE CARD */}
          {report.score > 0 && (
            <Card className="bg-surface border border-border rounded-xl shadow-subtle">
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-text">
                  <Award className="w-5 h-5 text-accent" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2">
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="text-4xl sm:text-5xl font-black text-text">
                    {report.score}
                    <span className="text-sm font-medium text-text-muted ml-1">/ 100</span>
                  </div>
                  <div className="w-full max-w-sm bg-surface-2 rounded-full h-2.5 overflow-hidden border border-border">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${Math.min(report.score, 100)}%` }}
                    />
                  </div>
                  <div className="text-center mt-1">
                    <p className="text-base font-bold text-text">
                      {report.score >= 80
                        ? "Excellent Performance!"
                        : report.score >= 60
                          ? "Good Effort!"
                          : "Needs Practice"}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {report.score >= 80 ? "You're interview ready" : "Keep practicing to improve confidence"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* FEEDBACK */}
          {report.feedback && (
            <Card className="bg-surface border border-border rounded-xl shadow-subtle">
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-text">
                  <Target className="w-5 h-5 text-primary" />
                  AI Coach Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2">
                <div className="bg-surface-2/60 border border-border rounded-xl p-4 sm:p-5">
                  <p className="text-sm font-semibold text-text mb-2 leading-snug">
                    "{report.feedback.split(".")[0]}"
                  </p>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    {report.feedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TRANSCRIPT */}
          {report.transcript && (
            <Card className="bg-surface border border-border rounded-xl shadow-subtle">
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-text">
                  <BarChart3 className="w-5 h-5 text-text-muted" />
                  Call Transcript
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2">
                <div className="max-h-80 overflow-y-auto rounded-lg border border-border bg-surface-2 p-4">
                  <pre className="whitespace-pre-wrap text-xs font-mono text-text leading-relaxed">
                    {report.transcript}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link to="/ai-voice-coach" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-11 text-xs font-semibold rounded-lg border-border text-text hover:bg-surface-2 cursor-pointer"
              >
                <Mic className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
            </Link>
            <Button
              className="flex-1 h-11 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-on-primary shadow-soft cursor-pointer"
              onClick={() => window.print()}
            >
              <Download className="w-4 h-4 mr-2" />
              Download / Print Summary
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CallReport;
