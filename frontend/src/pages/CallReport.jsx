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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 py-20 flex items-center justify-center ">
          <Card className="w-full max-w-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <div className="w-12 h-12 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-xl text-gray-600 dark:text-gray-300">Loading report...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 py-20 flex items-center justify-center g:mt-16 lg:ml-64">
          <Card className="w-full max-w-2xl bg-white/70 dark:bg-slate-800/70">
            <CardContent className="p-12 text-center">
              <MicOff className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">Report not found</h3>
              <Link
                to="/ai-voice-coach"
                className="inline-flex items-center gap-2 mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold"
              >
                <Mic className="w-5 h-5" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 py-8 px-4 lg:mt-16 lg:ml-64">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* HEADER */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Mic className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black">
                      {report.mode?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </h1>
                    <div className="flex items-center gap-4 text-blue-100 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(report.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{report.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 ml-auto">
                  <Badge className="text-lg px-4 py-2 bg-white/20 backdrop-blur-sm border-white/30">
                    {report.status?.toUpperCase()}
                  </Badge>
                  {report.score > 0 && (
                    <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-2xl font-bold text-lg">
                      {report.score}/100
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* SCORE CARD */}
          {report.score > 0 && (
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-xl border-0 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-500" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4 p-8">
                  <div className="text-5xl font-black text-gray-900 dark:text-white">
                    {report.score}
                  </div>
                  <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full shadow-lg transition-all"
                      style={{ width: `${Math.min(report.score, 100)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {report.score >= 80
                        ? "Excellent!"
                        : report.score >= 60
                          ? "Good!"
                          : "Keep Practicing!"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      You're {report.score >= 80 ? "interview ready" : "improving fast"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TRANSCRIPT */}
          {report.transcript && (
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Call Transcript & Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-8 border-t border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 dark:bg-slate-900/50 p-6 rounded-2xl font-mono text-gray-800 dark:text-gray-200">
                    {report.transcript}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* FEEDBACK */}
          {report.feedback && (
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200/50 dark:border-emerald-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
                  <Target className="w-7 h-7" />
                  AI Coach Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <p className="text-2xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
                    "{report.feedback.split(".")[0]}"
                  </p>
                  <div className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                    {report.feedback}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link to="/ai-voice-coach" className="flex-1">
              <Button variant="outline" size="lg" className="w-full h-14 font-semibold text-lg">
                <Mic className="w-5 h-5 mr-2" />
                Practice Again
              </Button>
            </Link>
            <Button
              size="lg"
              className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-lg shadow-xl hover:shadow-2xl"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CallReport;
