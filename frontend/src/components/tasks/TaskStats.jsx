import React from "react";
import useTasks from "../../hooks/useTasks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  BookOpen,
  Briefcase,
  User,
} from "lucide-react";

const TaskStats = ({ className = "" }) => {
  const { stats, isLoading } = useTasks();

  const statsData = [
    {
      title: "Total Tasks",
      value: stats?.totalTasks || 0,
      icon: LayoutDashboard,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Completed",
      value: stats?.completedTasks || 0,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      title: "Pending",
      value: stats?.pendingTasks || 0,
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Study",
      value: stats?.studyTasks || 0,
      icon: BookOpen,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Job",
      value: stats?.jobTasks || 0,
      icon: Briefcase,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      title: "Personal",
      value: stats?.personalTasks || 0,
      icon: User,
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-100 dark:bg-pink-900/20",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}
    >
      {statsData.map((stat) => (
        <Card
          key={stat.title}
          className="group rounded-2xl border bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          <CardContent className="p-6 h-full">
            <div className="flex items-start justify-between mb-6">
              <div
                className={`p-3 rounded-2xl ${stat.bg} shadow-sm group-hover:scale-105 transition-transform duration-300`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>

              <Badge
                variant="secondary"
                className="px-3 py-1 text-xs font-semibold rounded-full"
              >
                Live
              </Badge>
            </div>

            <div className="space-y-2">
              <h3 className="text-4xl font-black tracking-tight text-foreground">
                {stat.value}
              </h3>

              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </p>
            </div>

            <div className="mt-5 h-1 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full w-2/3 bg-primary rounded-full group-hover:w-full transition-all duration-500" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskStats;