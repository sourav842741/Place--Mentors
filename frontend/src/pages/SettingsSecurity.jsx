import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import api from "../services/api";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { AlertTriangle, Clock, Laptop, LogOut, Shield, Smartphone, Globe } from "lucide-react";

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

function deviceBadge(device) {
  if (!device?.os) return <Badge variant="secondary">Device</Badge>;
  if (String(device.os).toLowerCase().includes("windows")) {
    return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">Windows</Badge>;
  }
  if (String(device.os).toLowerCase().includes("mac")) {
    return <Badge className="bg-gradient-to-r from-slate-500 to-gray-700 text-white">macOS</Badge>;
  }
  if (String(device.os).toLowerCase().includes("android")) {
    return (
      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">Android</Badge>
    );
  }
  return <Badge variant="secondary">Device</Badge>;
}

export default function SettingsSecurity() {
  const { user } = useSelector((state) => state.user);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState(null);

  const refreshSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/sessions");
      // ApiResponse wrapper: { data: { sessions: [...] } } OR legacy { sessions: [...] }
      const list = res?.data?.data?.sessions || res?.data?.sessions || [];
      setSessions(list);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) refreshSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const { currentSession, otherSessions } = useMemo(() => {
    const current = sessions.find((s) => s.isCurrent) || sessions[0] || null;
    const others = sessions.filter((s) => !s.isCurrent);
    return { currentSession: current, otherSessions: others };
  }, [sessions]);

  const logoutOtherDevices = async () => {
    setMutating(true);
    setError(null);
    try {
      await api.post("/api/sessions/logout-all");
      await refreshSessions();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Logout failed");
    } finally {
      setMutating(false);
    }
  };

  const logoutDevice = async (sessionId) => {
    if (!sessionId) return;
    setMutating(true);
    setError(null);
    try {
      await api.delete(`/api/sessions/${sessionId}`);
      await refreshSessions();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Logout failed");
    } finally {
      setMutating(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-4 sm:p-6 bg-linear-to-br from-slate-100 via-blue-50 to-purple-100 dark:from-gray-950 dark:via-gray-900 dark:to-black lg:mt-16 lg:ml-64">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                Security Settings
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Review your active logins and keep your account safe.
              </p>
            </div>

            <Button
              onClick={logoutOtherDevices}
              disabled={mutating}
              className="rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:opacity-90"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout All Other Devices
            </Button>
          </div>

          {error && (
            <Card className="p-4 mb-4 border border-red-200 dark:border-red-800 bg-red-50/60 dark:bg-red-950/30 text-red-700 dark:text-red-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold">Something went wrong</div>
                  <div className="text-sm opacity-90">{error}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Active Sessions */}
          <Card className="p-5 sm:p-6 rounded-3xl shadow-sm bg-white/80 dark:bg-gray-900 backdrop-blur-xl border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Sessions</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Current device and other logged-in browsers for your account.
            </p>

            {loading ? (
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                <div className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
              </div>
            ) : (
              <div className="mt-6 grid md:grid-cols-2 gap-5">
                {/* Current */}
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 flex items-center justify-center">
                        <Laptop className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Current Device
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Always active
                        </div>
                      </div>
                    </div>

                    {currentSession ? (
                      <div className="flex items-center gap-2">
                        {deviceBadge(currentSession)}
                        <Badge className="bg-blue-600 text-white">Current</Badge>
                      </div>
                    ) : null}
                  </div>

                  {currentSession ? (
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Browser</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {currentSession.browser || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">OS</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {currentSession.os || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Login Time</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDateTime(currentSession.loginTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Last Active</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatDateTime(currentSession.lastActive)}
                        </span>
                      </div>
                      {currentSession.ipAddress ? (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">IP Address</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {currentSession.ipAddress}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      No active sessions found.
                    </div>
                  )}
                </div>

                {/* Other */}
                <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Other Devices
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {otherSessions.length} session(s)
                      </div>
                    </div>
                    <BellIcon />
                  </div>

                  <div className="mt-4 space-y-3">
                    {otherSessions.length === 0 ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        No other devices are currently logged in.
                      </div>
                    ) : (
                      otherSessions.map((s) => (
                        <div
                          key={s.sessionId}
                          className="p-3 rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-950/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-500" />
                                <div className="font-semibold text-gray-900 dark:text-white truncate">
                                  {s.browser || "Unknown Browser"}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {s.deviceName || "Device"} • {s.os || "Unknown OS"}
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              onClick={() => logoutDevice(s.sessionId)}
                              disabled={mutating}
                              className="rounded-xl border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 hover:bg-red-50/60 dark:hover:bg-red-950/30"
                            >
                              <LogOut className="w-4 h-4 mr-2" />
                              Logout
                            </Button>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-gray-400">Login</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {formatDateTime(s.loginTime)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-gray-500 dark:text-gray-400">Last</span>
                              <span className="text-gray-900 dark:text-white font-medium">
                                {formatDateTime(s.lastActive)}
                              </span>
                            </div>
                            {s.ipAddress ? (
                              <div className="col-span-2 flex items-center justify-between">
                                <span className="text-gray-500 dark:text-gray-400">IP</span>
                                <span className="text-gray-900 dark:text-white font-medium truncate">
                                  {s.ipAddress}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Future-ready: Login Activity */}
          <Card className="mt-5 p-5 sm:p-6 rounded-3xl shadow-sm bg-white/80 dark:bg-gray-900 backdrop-blur-xl border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Login Activity</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Coming soon: location tracking, full history, and anomaly detection.
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              We already store device metadata in your session records.
            </div>
          </Card>

          {/* Future-ready: 2FA */}
          <Card className="mt-5 p-5 sm:p-6 rounded-3xl shadow-sm bg-white/80 dark:bg-gray-900 backdrop-blur-xl border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Two-Factor Authentication (2FA)
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Coming soon: manage 2FA, trusted devices, and security preferences.
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <Smartphone className="w-4 h-4" />
              For now, use your existing 2FA endpoints.
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}

function BellIcon() {
  return (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 flex items-center justify-center">
      <BellGlyph />
    </div>
  );
}

function BellGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2Zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z"
        fill="currentColor"
        className="text-blue-600 dark:text-blue-400"
      />
    </svg>
  );
}
