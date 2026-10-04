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
  const osName = device?.os ? String(device.os) : "Device";
  return (
    <Badge variant="outline" className="bg-surface-2 text-text border-border text-xs font-medium px-2 py-0.5 rounded-md">
      {osName}
    </Badge>
  );
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
      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">
                  Security Settings
                </h1>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                  Review your active logins and manage account devices.
                </p>
              </div>
            </div>

            <Button
              onClick={logoutOtherDevices}
              disabled={mutating}
              className="h-9 px-3.5 text-xs font-semibold rounded-lg bg-danger hover:bg-danger-hover text-on-danger shadow-soft flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout All Other Devices
            </Button>
          </div>

          {error && (
            <Card className="p-4 border border-danger/20 bg-danger-soft text-danger rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold text-xs">Error</div>
                  <div className="text-xs opacity-90 mt-0.5">{error}</div>
                </div>
              </div>
            </Card>
          )}

          {/* Active Sessions */}
          <Card className="p-5 sm:p-6 rounded-xl shadow-subtle bg-surface border border-border">
            <h2 className="text-base sm:text-lg font-bold text-text">Active Sessions</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Current device and other logged-in browsers for your account.
            </p>

            {loading ? (
              <div className="mt-5 grid md:grid-cols-2 gap-4">
                <div className="h-28 bg-surface-2 rounded-xl animate-pulse border border-border" />
                <div className="h-28 bg-surface-2 rounded-xl animate-pulse border border-border" />
              </div>
            ) : (
              <div className="mt-5 grid md:grid-cols-2 gap-5">
                {/* Current */}
                <div className="rounded-xl border border-border bg-surface-2/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                        <Laptop className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-text">
                          Current Device
                        </div>
                        <div className="text-[11px] text-text-muted">
                          Always active
                        </div>
                      </div>
                    </div>

                    {currentSession ? (
                      <div className="flex items-center gap-1.5">
                        {deviceBadge(currentSession)}
                        <Badge className="bg-primary-soft text-primary border border-primary/20 text-xs font-semibold px-2 py-0.5 rounded-md">
                          Current
                        </Badge>
                      </div>
                    ) : null}
                  </div>

                  {currentSession ? (
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Browser</span>
                        <span className="font-medium text-text">
                          {currentSession.browser || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">OS</span>
                        <span className="font-medium text-text">
                          {currentSession.os || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Login Time</span>
                        <span className="font-medium text-text">
                          {formatDateTime(currentSession.loginTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">Last Active</span>
                        <span className="font-medium text-text">
                          {formatDateTime(currentSession.lastActive)}
                        </span>
                      </div>
                      {currentSession.ipAddress ? (
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">IP Address</span>
                          <span className="font-medium text-text">
                            {currentSession.ipAddress}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-4 text-xs text-text-muted">
                      No active sessions found.
                    </div>
                  )}
                </div>

                {/* Other */}
                <div className="rounded-xl border border-border bg-surface-2/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs sm:text-sm text-text">
                        Other Devices
                      </div>
                      <div className="text-[11px] text-text-muted">
                        {otherSessions.length} session(s)
                      </div>
                    </div>
                    <BellIcon />
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {otherSessions.length === 0 ? (
                      <div className="py-6 text-center text-xs text-text-muted">
                        No other devices are currently logged in.
                      </div>
                    ) : (
                      otherSessions.map((s) => (
                        <div
                          key={s.sessionId}
                          className="p-3 rounded-lg border border-border bg-surface shadow-subtle"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Globe className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                <div className="font-semibold text-xs text-text truncate">
                                  {s.browser || "Unknown Browser"}
                                </div>
                              </div>
                              <div className="text-[11px] text-text-muted mt-0.5">
                                {s.deviceName || "Device"} • {s.os || "Unknown OS"}
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              onClick={() => logoutDevice(s.sessionId)}
                              disabled={mutating}
                              className="h-7 px-2.5 text-xs font-semibold rounded-md border-danger/30 text-danger hover:bg-danger-soft transition-colors cursor-pointer"
                            >
                              <LogOut className="w-3 h-3 mr-1" />
                              Logout
                            </Button>
                          </div>

                          <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[11px] border-t border-border/60 pt-2">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-text-muted">Login</span>
                              <span className="text-text font-medium truncate">
                                {formatDateTime(s.loginTime)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-text-muted">Last</span>
                              <span className="text-text font-medium truncate">
                                {formatDateTime(s.lastActive)}
                              </span>
                            </div>
                            {s.ipAddress ? (
                              <div className="col-span-2 flex items-center justify-between">
                                <span className="text-text-muted">IP</span>
                                <span className="text-text font-medium truncate">
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
          <Card className="p-5 rounded-xl shadow-subtle bg-surface border border-border">
            <h2 className="text-sm font-bold text-text">Login Activity & Geolocation</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Location tracking, history logs, and anomaly detection.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Device metadata and timestamps are securely logged for your protection.
            </div>
          </Card>

          {/* Future-ready: 2FA */}
          <Card className="p-5 rounded-xl shadow-subtle bg-surface border border-border">
            <h2 className="text-sm font-bold text-text">
              Two-Factor Authentication (2FA)
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Manage 2FA, trusted devices, and security preferences.
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
              <Smartphone className="w-3.5 h-3.5 text-primary" />
              OTP verification is enabled on login to safeguard account access.
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
    <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center">
      <BellGlyph />
    </div>
  );
}

function BellGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2Zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2Z"
        fill="currentColor"
        className="text-primary"
      />
    </svg>
  );
}
