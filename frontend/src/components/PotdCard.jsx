import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, CheckCircle, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "@/hooks/useCountdown";
import { getPotdStatus, completePotd } from "@/services/api.js";

export default function PotdCard({ onClick }) {
  const [status, setStatus] = useState({
    locked: false,
    remaining: 0,
    solved: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  const { remaining, formattedTime } = useCountdown(status.remaining);
  const navigate = useNavigate();

  //  API CALL
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const res = await getPotdStatus();
        const data = res.data.data;

        setStatus({
          locked: data.locked,
          remaining: data.remaining,
          solved: data.solved,
        });
      } catch (err) {
        console.error("Failed to fetch POTD status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  //  auto unlock
  useEffect(() => {
    if (remaining <= 0 && status.locked) {
      setStatus((prev) => ({
        ...prev,
        locked: false,
        remaining: 0,
      }));
    }
  }, [remaining]);

  const handleStart = async () => {
    try {
      await completePotd();

      setStatus({
        locked: true,
        remaining: 24 * 60 * 60 * 1000,
        solved: true,
      });

      navigate("/potd");
    } catch (err) {
      console.error("Failed to complete POTD:", err);
    }

    onClick?.();
  };

  const locked = status.locked;

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-80 rounded-2xl" />;
  }

  return (
    <Card
      onClick={() => navigate("/potd")} // ✅ always navigate
      className={`relative bg-white border-2 rounded-2xl shadow-sm cursor-pointer transition ${
        locked
          ? "border-orange-300"
          : "border-gray-200 hover:border-black/50 hover:shadow-md"
      }`}
    >
      <CardContent className="relative p-8 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gray-100 rounded-2xl">
            <Brain className="w-8 h-8 text-gray-900" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Quiz POTD</h3>
            <p className="text-gray-500">Daily MCQ Challenge</p>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Test your interview knowledge with today's quiz!
        </p>

        {/* ICON */}
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
        <div className="flex justify-between items-center absolute bottom-6 left-6 right-6">
          <span className="text-3xl">🧠</span>
          <button
            disabled={locked || isLoading}
            onClick={(e) => {
              e.stopPropagation(); 
              handleStart();
            }}
            className={`px-6 py-3 rounded-xl font-semibold ${
              locked ? "bg-gray-400 text-gray-600" : "bg-black text-white"
            }`}
          >
            {locked ? (
              <>
                {status.solved && "✅ "}⏳{" "}
                {remaining > 0 ? formattedTime : "Loading..."}
              </>
            ) : status.solved ? (
              <>✅ Solved Today</>
            ) : (
              <>
                Start Today's Challenge
                <ArrowRight className="inline w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
