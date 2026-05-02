import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Circle, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const statusConfig = {
  Open: {
    icon: Circle,
    className:
      'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  'In Progress': {
    icon: Loader2,
    className:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  Solved: {
    icon: CheckCircle2,
    className:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    dot: 'bg-green-500',
  },
  Rejected: {
    icon: XCircle,
    className:
      'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    dot: 'bg-red-500',
  },
};

export default function TicketStatusBadge({ status, showIcon = true, className = '' }) {
  const config = statusConfig[status] || statusConfig.Open;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} font-semibold text-xs px-2.5 py-0.5 gap-1.5 ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </Badge>
  );
}
