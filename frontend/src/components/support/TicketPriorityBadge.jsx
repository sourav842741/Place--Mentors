import React from "react";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Minus, ArrowUp } from "lucide-react";

const priorityConfig = {
  Low: {
    icon: ArrowDown,
    className:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  },
  Medium: {
    icon: Minus,
    className:
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  },
  High: {
    icon: ArrowUp,
    className:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  },
};

export default function TicketPriorityBadge({ priority, showIcon = true, className = "" }) {
  const config = priorityConfig[priority] || priorityConfig.Low;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} font-medium text-xs px-2 py-0.5 gap-1 ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {priority}
    </Badge>
  );
}
