import React from "react";
import useTasks from "../../hooks/useTasks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  BookOpen,
  Briefcase,
  User,
  ListTodo,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const TaskStats = ({ className = "" }) => {
  const { tasks, stats, isLoading } = useTasks();

  const total = tasks?.length ?? stats?.totalTasks ?? 0;
  const completed = tasks?.filter((t) => t.completed).length ?? stats?.completedTasks ?? 0;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const study = tasks?.filter((t) => t.category === "Study").length ?? stats?.studyTasks ?? 0;
  const job = tasks?.filter((t) => t.category === "Job").length ?? stats?.jobTasks ?? 0;
  const personal = tasks?.filter((t) => t.category === "Personal").length ?? stats?.personalTasks ?? 0;
  const highPriority = tasks?.filter((t) => t.priority === "High" && !t.completed).length ?? 0;

  if (isLoading && total === 0) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 ${className}`}>
      {/* 1. Overall Completion Progress Card (5 Cols) */}
      <Card className="md:col-span-5 rounded-2xl border border-border bg-gradient-to-br from-card to-muted/20 shadow-xs hover:shadow-md transition-all">
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-text uppercase tracking-wider block">
                  Completion Rate
                </span>
                <span className="text-[11px] text-text-muted">Placement prep progress</span>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-mono font-semibold ${
                percentage === 100 && total > 0
                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                  : "border-border text-text"
              }`}
            >
              {percentage}% Done
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-semibold text-text">
                {completed} <span className="font-normal text-text-muted">of</span> {total} tasks
                completed
              </span>
              <span className="text-[11px] text-text-muted font-mono">{pending} remaining</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Key Metrics Summary (3 Cols) */}
      <Card className="md:col-span-3 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all">
        <CardContent className="p-4 sm:p-5 flex items-center justify-around h-full">
          {/* Total */}
          <div className="text-center space-y-1">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto border border-blue-500/20">
              <ListTodo className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-text">{total}</div>
            <div className="text-[11px] font-medium text-text-muted">Total</div>
          </div>

          <div className="h-10 w-px bg-border/60" />

          {/* Pending */}
          <div className="text-center space-y-1">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-500">{pending}</div>
            <div className="text-[11px] font-medium text-text-muted">Pending</div>
          </div>

          <div className="h-10 w-px bg-border/60" />

          {/* High Priority */}
          <div className="text-center space-y-1">
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-500">{highPriority}</div>
            <div className="text-[11px] font-medium text-text-muted">Urgent</div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Category Breakdown (4 Cols) */}
      <Card className="md:col-span-4 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all">
        <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text uppercase tracking-wider">
              Category Distribution
            </span>
            <span className="text-[11px] text-text-muted">Goals</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Study */}
            <div className="p-2 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                <BookOpen className="w-3 h-3" />
                Study
              </div>
              <div className="text-lg font-bold font-mono text-text mt-0.5">{study}</div>
            </div>

            {/* Job */}
            <div className="p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <Briefcase className="w-3 h-3" />
                Job
              </div>
              <div className="text-lg font-bold font-mono text-text mt-0.5">{job}</div>
            </div>

            {/* Personal */}
            <div className="p-2 rounded-xl bg-pink-500/5 border border-pink-500/20 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] text-pink-600 dark:text-pink-400 font-medium">
                <User className="w-3 h-3" />
                Self
              </div>
              <div className="text-lg font-bold font-mono text-text mt-0.5">{personal}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskStats;
