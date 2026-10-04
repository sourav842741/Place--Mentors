import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStreak, updateRemainingTime } from "../redux/streakSlice";
import { useCountdown } from "../hooks/useCountdown";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton.jsx";
import { Flame, Crown, Clock, CalendarDays } from "lucide-react";

const StreakCalendar = () => {
  const dispatch = useDispatch();
  const { data: streakData = {}, loading } = useSelector((state) => state.streak);

  const {
    currentStreak = 0,
    bestStreak = 0,
    completedDays = [],
    todaySolved = false,
    remainingTime,
  } = streakData;

  // Countdown to midnight
  const getMsToMidnight = useCallback(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow - now;
  }, []);

  const { formattedTime } = useCountdown(getMsToMidnight());

  useEffect(() => {
    dispatch(fetchStreak());
  }, [dispatch]);

  useEffect(() => {
    dispatch(updateRemainingTime(formattedTime));
  }, [formattedTime, dispatch]);

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  const todayStr = currentDate.toISOString().split("T")[0];

  // Generate calendar
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day).toISOString().split("T")[0]);
    }

    return days;
  };

  const monthDays = getDaysInMonth(currentDate);

  const weeks = [];
  for (let i = 0; i < monthDays.length; i += 7) {
    weeks.push(monthDays.slice(i, i + 7));
  }

  const isCompleted = (dateStr) => completedDays?.includes(dateStr);

  // 🔥 FINAL FIXED LOGIC
  const getDayClass = (dateStr) => {
    if (!dateStr) return "invisible";

    const isToday = dateStr === todayStr;
    const completed = isCompleted(dateStr);

    // Completed & Today
    if (completed && isToday) {
      return "bg-primary text-on-primary ring-2 ring-primary/40 scale-105 font-bold border-primary";
    }

    if (completed) {
      return "bg-primary text-on-primary border-primary font-medium";
    }

    // Today (if not completed)
    if (isToday) {
      return "ring-2 ring-primary ring-offset-2 ring-offset-bg bg-primary-soft text-primary border-primary font-bold";
    }

    return "bg-surface-2 text-text-muted border-border";
  };

  if (loading) {
    return (
      <Card className="w-full bg-surface border border-border rounded-xl">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-surface border border-border shadow-subtle rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-text">
          <Flame className="h-5 w-5 text-accent" />
          Streak Calendar
        </CardTitle>
        <p className="text-xs text-text-muted">
          Solve one problem a day to keep your streak
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Stats */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-accent-soft text-accent border border-accent/20 font-semibold px-2.5 py-1">
              <Flame className="w-3.5 h-3.5 mr-1" />
              {currentStreak} day{currentStreak !== 1 ? "s" : ""}
            </Badge>

            {todaySolved && (
              <Badge className="border-success/20 text-success bg-success-soft font-semibold px-2.5 py-1">Today ✓</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-surface-2 text-text-muted border border-border px-2.5 py-1">
              <Crown className="w-3.5 h-3.5 mr-1 text-accent" />
              Best: {bestStreak}
            </Badge>

            <div className="flex items-center gap-1 text-xs text-text-subtle font-medium">
              <Clock className="w-3.5 h-3.5" />
              {remainingTime}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
            <CalendarDays className="w-4 h-4" />
            {currentMonth}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["S", "M", "T", "W", "Th", "F", "S"].map((day, i) => (
              <div
                key={i}
              className="text-[10px] font-semibold text-text-subtle text-center"
              >
                {day}
              </div>
            ))}

            {weeks.map((week, i) => (
              <React.Fragment key={i}>
                {week.map((dateStr, j) => (
                  <div
                    key={j}
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all mx-auto text-[10px] font-medium ${getDayClass(dateStr)}`}
                  >
                    {dateStr && (
                      <span className="text-xs font-medium">{new Date(dateStr).getDate()}</span>
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCalendar;
