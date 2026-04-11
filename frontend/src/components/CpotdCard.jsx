import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

  const locked = status.locked;

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-80 rounded-2xl" />;
  }

  return (
    <Card
      onClick={() => navigate("/coding-potd")} 
      className={`relative bg-white border-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] cursor-pointer ${
        locked
          ? "border-orange-300"
          : "border-gray-200 hover:border-black/50"
      }`}
    >
      <CardContent className="relative p-8 pb-12">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gray-100 rounded-2xl shadow-sm">
            <Code className="w-8 h-8 text-gray-900" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Coding POTD
            </h3>
            <p className="text-gray-500 text-lg font-medium">
              Daily DSA Challenge
            </p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Solve today's hand-picked coding problem and earn XP + badges!
        </p>

        {/* STATUS ICON */}
        {locked ? (
          <div className="absolute top-4 right-4 p-3 bg-orange-100 rounded-full">
            <Clock className="w-6 h-6 text-orange-700" />
          </div>
        ) : status.solved ? (
          <div className="absolute top-4 right-4 p-3 bg-green-100 rounded-full">
            <CheckCircle className="w-6 h-6 text-green-700" />
          </div>
        ) : null}

        {/* BUTTON */}
        <div className="flex items-center justify-between absolute bottom-6 left-6 right-6">
          <span className="text-3xl">💻</span>

          <button
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();

              if (!locked) {
                handleStart(e);
              } else {
                navigate("/cpotd");
              }
            }}
            className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-xl ${
              locked
                ? "bg-gray-400 text-gray-600"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {locked ? (
              <>
                {status.solved && "✅ "}
                ⏳ {remaining > 0 ? formattedTime : "Loading..."}
              </>
            ) : status.solved ? (
              <>✅ Completed</>
            ) : (
              <>
                Start Today's Challenge
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}