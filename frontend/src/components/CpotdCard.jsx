import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Code, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "@/hooks/useCountdown";
import { getCpotdStatus, completeCpotd } from "@/services/api.js";

export default function CpotdCard() {
  const [status, setStatus] = useState({
    locked: false,
    remaining: 0,
    solved: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  const { remaining, formattedTime } = useCountdown(status.remaining);
  const navigate = useNavigate();

  //  FETCH STATUS
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
        console.error("CPOTD status error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  //  AUTO UNLOCK
  useEffect(() => {
    if (remaining <= 0 && status.locked) {
      setStatus((prev) => ({
        ...prev,
        locked: false,
        remaining: 0,
      }));
    }
  }, [remaining]);

  // HANDLE START
  const handleStart = async (e) => {
    e.stopPropagation();

    try {
      await completeCpotd();

      setStatus({
        locked: true,
        remaining: 24 * 60 * 60 * 1000,
        solved: true,
      });

      navigate("/cpotd");
    } catch (err) {
      console.error("CPOTD complete error:", err);
    }
  };

  const locked = status.locked && !status.solved;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-between h-100 p-6 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm animate-pulse transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-32" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        </div>
        <div className="flex justify-between items-center">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-800 rounded-full" />
          <div className="w-32 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
      </div>
    );
  }

  return (
      <Card
      onClick={() => navigate("/coding-potd")}
      className={`flex flex-col justify-between h-100 p-6 bg-white dark:bg-gray-900 dark:border-white/10 border-2 rounded-2xl shadow-sm  duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-colors ${
        locked
          ? "border-orange-200 bg-orange-50/50"
          : status.solved
          ? "border-green-200 bg-green-50/50"
          : "border-gray-200 hover:border-blue-300"
      }`}
    >
      <CardContent className="flex flex-col justify-between flex-1 p-0 h-full">
        {/* TOP SECTION */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-linear-to-br from-blue-500/10 to-blue-600/10 border border-blue-200 rounded-2xl shrink-0">
            <Code className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight">Coding POTD</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Daily DSA Challenge</p>
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed flex-1 min-h-20 mb-6">
          Solve today's hand-picked coding problem and earn XP + badges!
        </p>

        {/* TOP-RIGHT STATUS ICON */}
        <div className="absolute top-6 right-6">
          {locked ? (
            <div className="p-2.5 bg-orange-100 border border-orange-200 rounded-2xl">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          ) : status.solved ? (
            <div className="p-2.5 bg-green-100 border border-green-200 rounded-2xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          ) : null}
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-2xl">💻</span>
          <button
            disabled={locked}
            onClick={(e) => {
              e.stopPropagation();
              if (!locked) {
                handleStart(e);
              } else {
                navigate("/cpotd");
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 ${
              locked
                ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 cursor-not-allowed"
                : status.solved
                ? "bg-green-100 hover:bg-green-200 text-green-800 border border-green-200"
                : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg border-0"
            }`}
          >
            {locked ? (
              <>
                ⏳ {formattedTime}
              </>
            ) : status.solved ? (
              <>
                ✅ Completed
                <CheckCircle className="w-4 h-4" />
              </>
            ) : (
              <>
                Start 
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
