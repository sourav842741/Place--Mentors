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
    return <div className="min-h-[260px] h-full rounded-xl bg-surface-2 border border-border animate-pulse" />;
  }

  return (
    <div
      onClick={() => navigate("/coding-potd")}
      className={`relative flex flex-col justify-between h-full min-h-[260px] p-5 rounded-xl border transition-all duration-200 cursor-pointer shadow-subtle hover:shadow-card bg-surface ${
        locked
          ? status.solved
            ? "border-success/30 bg-success-soft/20"
            : "border-accent/30 bg-accent-soft/20"
          : "border-border hover:border-primary/40"
      }`}
    >
      <div className="flex flex-col justify-between flex-1">
        {/* TOP */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary">
            <Code className="w-5 h-5" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-base font-bold text-text">Coding POTD</h3>
            <p className="text-xs text-text-muted">Daily DSA Challenge</p>
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="text-xs text-text-muted leading-relaxed my-3">
          Solve today's hand-picked coding problem and earn verified XP and badges!
        </p>

        {/* STATUS ICON */}
        <div className="absolute top-5 right-5">
          {locked ? (
            status.solved ? (
              <div className="p-1.5 bg-success-soft rounded-lg text-success">
                <CheckCircle className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1.5 bg-accent-soft rounded-lg text-accent">
                <Clock className="w-4 h-4" />
              </div>
            )
          ) : null}
        </div>

        {/* BUTTON */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs font-medium text-text-subtle">Daily DSA</span>

          {locked ? (
            status.solved ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-success-soft text-success text-xs font-semibold border border-success/20">
                <CheckCircle className="w-3.5 h-3.5" /> Completed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-2 text-text-subtle text-xs font-medium border border-border">
                <Clock className="w-3.5 h-3.5" /> Next in {formattedTime}
              </span>
            )
          ) : (
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-on-primary text-xs font-semibold shadow-soft transition-colors cursor-pointer"
            >
              Start
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
