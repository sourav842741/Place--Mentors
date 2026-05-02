import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Mic, Clock, Phone, Award, BadgeCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    return Icon ? <Icon className="w-4 h-4" /> : <Mic className="w-4 h-4" />;
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
        <div
          className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 py-20"
          g:mt-16
          lg:ml-64
        >
          <div className="max-w-4xl mx-auto p-8">
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <div className="w-12 h-12 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-300">Loading call history...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 py-8 px-4 ">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-3xl font-black bg-gradient-to-r from-gray-900 to-slate-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                      Call History
                    </CardTitle>
                    <CardDescription>Total calls: {calls.length}</CardDescription>
                  </div>
                  <Link to="/ai-voice-coach">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold shadow-xl"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      New Call
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Table */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-2xl border-0">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-2 border-gray-200 dark:border-gray-700">
                    <TableHead className="w-12">Mode</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calls.map((call) => (
                    <TableRow
                      key={call._id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-gray-800 group"
                    >
                      <TableCell className="font-medium flex items-center gap-2">
                        {getModeIcon(call.mode)}
                        <span>
                          {call.mode.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(call.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{call.phone}</TableCell>
                      <TableCell>
                        <span className="text-sm font-mono">
                          {formatDuration(call.duration || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            call.status === "completed"
                              ? "default"
                              : call.status === "active"
                                ? "secondary"
                                : "outline"
                          }
                          className={`${
                            call.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/50"
                              : call.status === "active"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/50"
                          }`}
                        >
                          {call.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {call.score > 0 ? (
                          <div className="flex items-center gap-1">
                            <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(call.score, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{call.score}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link
                          to={`/voice-report/${call._id}`}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium text-sm flex items-center gap-1 group hover:underline"
                        >
                          View Report
                        </Link>
                        {call.transcript && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {calls.length === 0 && (
                <div className="p-20 text-center">
                  <MicOff className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    No call history
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    Start your first AI practice call to see history here.
                  </p>
                  <Link to="/ai-voice-coach">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                      <Mic className="w-5 h-5 mr-3" />
                      Start First Call
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CallHistory;
