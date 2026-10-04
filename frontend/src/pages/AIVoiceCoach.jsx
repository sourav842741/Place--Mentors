import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Mic, Phone, Headphones, MicOff, Play, Clock, Award, PhoneCall, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import { startVoiceCallAsync, fetchVoiceHistory } from "../redux/voiceSlice";

import Navbar from "../components/Navbar";
import { trackEvent } from "../hooks/useAnalytics";

const AIVoiceCoach = () => {
  const dispatch = useDispatch();

  const { loading, entities } = useSelector((state) => state.voice);
  const history = entities || {};
  const recentCalls = Object.values(history).slice(0, 3);

  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState("hr-interview");
  const [isCalling, setIsCalling] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  // Load history
  useEffect(() => {
    dispatch(fetchVoiceHistory());
  }, [dispatch]);

  // Cooldown timer logic
  useEffect(() => {
    const saved = localStorage.getItem("voice_call_cooldown");

    if (saved) {
      const left = Math.max(0, Math.floor((Number(saved) - Date.now()) / 1000));
      setCooldownLeft(left);
    }

    const timer = setInterval(() => {
      const stored = localStorage.getItem("voice_call_cooldown");

      if (!stored) return;

      const left = Math.max(0, Math.floor((Number(stored) - Date.now()) / 1000));

      setCooldownLeft(left);

      if (left <= 0) {
        localStorage.removeItem("voice_call_cooldown");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const min = Math.floor(sec / 60);
    const secRemain = sec % 60;

    return `${min}:${String(secRemain).padStart(2, "0")}`;
  };

  const handleStartCall = async () => {
    if (!phone.trim()) {
      toast.error("Please enter phone number");
      return;
    }

    if (cooldownLeft > 0) {
      toast.error(`Please wait ${formatTime(cooldownLeft)} before next call`);
      return;
    }

    try {
      setIsCalling(true);

      await dispatch(
        startVoiceCallAsync({
          phone,
          mode,
        })
      ).unwrap();

      toast.success("Call started successfully");

      trackEvent("ai_interview_used", { type: "voice", mode });

      // Start 20 minute cooldown
      const endTime = Date.now() + 20 * 60 * 1000;
      localStorage.setItem("voice_call_cooldown", endTime);
      setCooldownLeft(20 * 60);

      setPhone("");
      dispatch(fetchVoiceHistory());
    } catch (error) {
      toast.error(error || "Failed to start call");
    } finally {
      setIsCalling(false);
    }
  };

  const modes = [
    {
      id: "hr-interview",
      title: "HR Interview",
      desc: "Realistic HR & placement interview practice",
      icon: PhoneCall,
    },
    {
      id: "spoken-english",
      title: "Spoken English",
      desc: "Fluency, grammar & confidence practice",
      icon: Mic,
    },
    {
      id: "motivation",
      title: "Motivation Coach",
      desc: "Confidence boost & discipline guidance",
      icon: Award,
    },
    {
      id: "resume-screening",
      title: "Resume Review",
      desc: "Resume screening & career feedback",
      icon: Headphones,
    },
  ];

  return (
    <>
      <Navbar />

      <div className="pt-24 lg:pt-24 lg:pl-64 px-4 md:px-8 pb-12 min-h-screen bg-bg text-text transition-colors duration-200">
        {/* HERO */}
        <div className="max-w-4xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary-soft text-primary text-xs font-semibold mb-3">
            <Mic className="w-3.5 h-3.5" />
            <span>Interactive Voice Training</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-text mb-3">
            AI Voice Interview Coach
          </h1>

          <p className="text-xs sm:text-sm text-text-muted max-w-2xl mx-auto leading-relaxed">
            Practice live spoken interviews, fluency, HR conversation scenarios and resume review over voice calls.
          </p>
        </div>

        {/* MODES */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modes.map(({ id, title, desc, icon: Icon }) => {
              const isSelected = mode === id;
              return (
                <div
                  key={id}
                  onClick={() => setMode(id)}
                  className={`cursor-pointer rounded-xl border p-5 flex flex-col justify-between transition-all duration-200 shadow-subtle ${
                    isSelected
                      ? "border-primary bg-primary-soft/10 ring-1 ring-primary/40"
                      : "border-border bg-surface hover:border-primary/40 hover:bg-surface-2"
                  }`}
                >
                  <div>
                    <div
                      className={`w-11 h-11 rounded-lg flex items-center justify-center mb-3.5 transition-colors ${
                        isSelected
                          ? "bg-primary text-on-primary shadow-soft"
                          : "bg-surface-2 text-text-muted border border-border"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="font-semibold text-text text-sm mb-1.5">{title}</h3>
                    <p className="text-xs text-text-muted leading-relaxed mb-4">{desc}</p>
                  </div>

                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full text-xs font-semibold rounded-lg h-8 transition-colors ${
                      isSelected
                        ? "bg-primary hover:bg-primary-hover text-on-primary shadow-soft"
                        : "border-border text-text hover:bg-surface-2"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMode(id);
                    }}
                  >
                    {isSelected ? "Selected" : "Select Mode"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* START CALL CARD */}
        <div className="max-w-lg mx-auto mb-16">
          <Card className="bg-surface border border-border rounded-xl shadow-subtle">
            <CardHeader className="text-center pb-4 pt-6">
              <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-text">
                Start AI Call
              </CardTitle>
              <div className="flex justify-center mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold">
                  Mode: {modes.find((m) => m.id === mode)?.title || "Interview"}
                </span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 px-6 pb-6 pt-2">
              <div>
                <label className="text-xs font-semibold text-text mb-1.5 block">
                  Phone Number
                </label>

                <Input
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 text-sm bg-surface-2 border-border text-text placeholder:text-text-muted rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                />
                <p className="text-[11px] text-text-muted mt-1.5">
                  Include country code (e.g. +91 for India).
                </p>
              </div>

              <Button
                onClick={handleStartCall}
                disabled={isCalling || loading || cooldownLeft > 0}
                className="w-full h-11 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-on-primary shadow-soft transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isCalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin mr-2" />
                    Connecting Call...
                  </>
                ) : cooldownLeft > 0 ? (
                  <>
                    <Timer className="w-4 h-4 mr-2" />
                    Next Call In {formatTime(cooldownLeft)}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Start {modes.find((m) => m.id === mode)?.title} Call
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-text-muted">
                {cooldownLeft > 0
                  ? "Cooldown active after successful call."
                  : "Keep your phone ready. AI will call you instantly."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RECENT CALLS */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-text-muted" />
            <h2 className="text-lg sm:text-xl font-bold text-text">Recent Calls</h2>

            <Badge variant="outline" className="ml-auto text-xs bg-surface-2 text-text-muted border-border font-medium px-2.5 py-0.5 rounded-full">
              {recentCalls.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {recentCalls.length > 0 ? (
              recentCalls.map((call, index) => (
                <div
                  key={call?._id || call?.id || call?.twilioCallSid || index}
                  className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between shadow-subtle hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
                      <Mic className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="font-semibold text-text text-sm">
                        {modes.find((m) => m.id === call?.mode)?.title || "AI Voice Call"}
                      </div>

                      <div className="text-xs text-text-muted mt-0.5">
                        {call?.createdAt ? new Date(call.createdAt).toLocaleString() : "Recently"}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/voice-report/${call?._id || call?.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary-soft hover:bg-primary-soft/80 transition-colors"
                  >
                    View Report →
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-surface border border-border rounded-xl p-10 text-center shadow-subtle">
                <MicOff className="w-10 h-10 mx-auto text-text-muted/40 mb-3" />
                <h3 className="font-semibold text-base text-text">No calls yet</h3>
                <p className="text-xs text-text-muted mt-1">Start your first AI call above to practice live speaking.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AIVoiceCoach;
