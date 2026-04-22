import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Code, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "@/hooks/useCountdown";
import { getCpotdStatus } from "@/services/api.js";

export default function CpotdCard() {
  const [status, setStatus] = useState({
    locked: false,
    remaining: 0,
    solved: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  const { remaining, formattedTime } = useCountdown(status.remaining);
  const navigate = useNavigate();

  // FETCH STATUS
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);

        const res = await getCpotdStatus();
        const data = res.data.data;

        setStatus({
          locked: data.locked,
          remaining: data.remaining,
          solved: data.solved,
        });
      } catch (err) {
        console.error("Failed to fetch CPOTD status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  // AUTO UNLOCK AFTER TIMER
  useEffect(() => {
    if (remaining <= 0 && status.locked && !status.solved) {
      setStatus((prev) => ({
        ...prev,
        locked: false,
        remaining: 0,
      }));
    }
  }, [remaining, status.locked, status.solved]);

  const handleStart = (e) => {
    e.stopPropagation();
    navigate("/coding-potd");
  };

  const locked = status.locked;

  if (isLoading) {
    return (
      <div className="h-[400px] rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
    );
  }

  return (
    <Card
      onClick={() => navigate("/coding-potd")}
      className={`relative flex flex-col justify-between h-[400px] p-6 bg-white dark:bg-gray-900 dark:border-white/10 border-2 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-300 ${
        locked
          ? status.solved
            ? "border-green-200 bg-green-50/50"
            : "border-orange-200 bg-orange-50/50"
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <CardContent className="flex flex-col justify-between flex-1 p-0 h-full">
        {/* TOP */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <Code className="w-7 h-7 text-blue-600" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Coding POTD
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Daily DSA Challenge
            </p>
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="text-gray-600 dark:text-gray-400 flex-1 mb-6">
          Solve today's hand-picked coding problem and earn XP + badges!
        </p>

        {/* STATUS ICON */}
        <div className="absolute top-6 right-6">
          {locked ? (
            status.solved ? (
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            ) : (
              <div className="p-2 bg-orange-100 rounded-xl">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            )
          ) : null}
        </div>

        {/* BUTTON */}
        <div className="flex items-center justify-between">
          <span className="text-2xl">💻</span>

          {locked ? (
            status.solved ? (
              <button
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold cursor-default"
              >
                ✅ Completed
              </button>
            ) : (
              <button
                disabled
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 cursor-not-allowed"
              >
                ⏳ {formattedTime}
              </button>
            )
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:scale-105 transition"
            >
              Start
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}