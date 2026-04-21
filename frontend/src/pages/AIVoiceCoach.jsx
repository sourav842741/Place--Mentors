import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import {
  Mic,
  Phone,
  Headphones,
  MicOff,
  Play,
  Clock,
  Award,
  PhoneCall,
  Timer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";
import {
  startVoiceCallAsync,
  fetchVoiceHistory,
} from "../redux/voiceSlice";

import Navbar from "../components/Navbar";

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
      const left = Math.max(
        0,
        Math.floor((Number(saved) - Date.now()) / 1000)
      );
      setCooldownLeft(left);
    }

    const timer = setInterval(() => {
      const stored = localStorage.getItem("voice_call_cooldown");

      if (!stored) return;

      const left = Math.max(
        0,
        Math.floor((Number(stored) - Date.now()) / 1000)
      );

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
      toast.error(
        `Please wait ${formatTime(cooldownLeft)} before next call`
      );
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
      color: "bg-blue-500",
    },
    {
      id: "spoken-english",
      title: "Spoken English",
      desc: "Fluency, grammar & confidence practice",
      icon: Mic,
      color: "bg-green-500",
    },
    {
      id: "motivation",
      title: "Motivation Coach",
      desc: "Confidence boost & discipline guidance",
      icon: Award,
      color: "bg-orange-500",
    },
    {
      id: "resume-screening",
      title: "Resume Review",
      desc: "Resume screening & career feedback",
      icon: Headphones,
      color: "bg-purple-500",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 px-4 md:px-8 py-8 lg:mt-14 lg:ml-64 md:mt-16">
        {/* HERO */}
        <div className="max-w-6xl mx-auto text-center mb-16 ">
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-6 py-3 rounded-3xl shadow-xl mb-8 border border-white/50">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-ping " />

           <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-gray-900 to-slate-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mt-6 sm:mt-0">
  PlaceMentor AI Voice Coach
</h1>
          </div>

          <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Practice interviews, spoken English, motivation and resume guidance
            through smart AI phone calls.
          </p>
        </div>

        {/* MODES */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {modes.map(({ id, title, desc, icon: Icon, color }) => (
              <Card
                key={id}
                className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardHeader>
                  <div
                    className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto shadow-xl`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <CardTitle className="text-center mt-4 text-xl">
                    {title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-5">
                    {desc}
                  </p>

                  <Button
                    className="w-full"
                    variant={mode === id ? "default" : "outline"}
                    onClick={() => setMode(id)}
                  >
                    {mode === id ? "Selected" : "Select"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* START CALL */}
        <div className="max-w-md mx-auto mb-16">
          <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center text-2xl flex justify-center items-center gap-3">
                <Phone className="w-7 h-7 text-blue-500" />
                Start AI Call
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Phone Number
                </label>

                <Input
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 text-lg"
                />
              </div>

              <Button
                onClick={handleStartCall}
                disabled={isCalling || loading || cooldownLeft > 0}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-70"
              >
                {isCalling ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                    Calling...
                  </>
                ) : cooldownLeft > 0 ? (
                  <>
                    <Timer className="w-5 h-5 mr-2" />
                    Next Call In {formatTime(cooldownLeft)}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start {modes.find((m) => m.id === mode)?.title} Call
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                {cooldownLeft > 0
                  ? "Cooldown active after successful call."
                  : "Keep your phone ready. AI will call you instantly."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RECENT CALLS */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-6 h-6 text-gray-500" />
            <h2 className="text-2xl font-bold">Recent Calls</h2>

            <Badge variant="outline" className="ml-auto">
              {recentCalls.length}
            </Badge>
          </div>

          <div className="grid gap-4">
            {recentCalls.length > 0 ? (
              recentCalls.map((call, index) => (
                <Card
                  key={
                    call?._id ||
                    call?.id ||
                    call?.twilioCallSid ||
                    index
                  }
                  className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-md hover:shadow-xl transition-all"
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30">
                      <Mic className="w-6 h-6 text-green-600" />
                    </div>

                    <div className="flex-1">
                      <div className="font-semibold">
                        {modes.find((m) => m.id === call?.mode)?.title ||
                          "AI Voice Call"}
                      </div>

                      <div className="text-sm text-gray-500">
                        {call?.createdAt
                          ? new Date(call.createdAt).toLocaleString()
                          : "Recently"}
                      </div>
                    </div>

                    <Link
                      to={`/voice-report/${call?._id || call?.id}`}
                      className="text-blue-600 text-sm font-medium"
                    >
                      View →
                    </Link>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-10 text-center">
                  <MicOff className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-semibold text-xl">No calls yet</h3>
                  <p className="text-gray-500 mt-2">
                    Start your first AI call above.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AIVoiceCoach;