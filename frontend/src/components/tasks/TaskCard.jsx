import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  Share2,
  Clock,
  Edit3,
  BookOpen,
  Briefcase,
  User,
  AlertCircle,
  MoreVertical,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { toggleTask, deleteTask, shareTask } from "../../redux/tasksSlice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TaskCard = ({ task, onEdit }) => {
  const dispatch = useDispatch();

  const isOverdue =
    task.dueDate && !task.completed && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const isDueToday =
    task.dueDate &&
    !task.completed &&
    new Date(task.dueDate).toDateString() === new Date().toDateString();

  const handleToggle = async () => {
    await dispatch(toggleTask(task._id));
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const ok = window.confirm("Are you sure you want to delete this task?");
    if (!ok) return;

    await dispatch(deleteTask(task._id));
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      await dispatch(shareTask(task._id));
    } catch (error) {
      // Toast handled in thunk
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const categoryConfig = {
    Study: {
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      icon: BookOpen,
    },
    Job: {
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Briefcase,
    },
    Personal: {
      color: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
      icon: User,
    },
  };

  const priorityConfig = {
    High: {
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      dot: "bg-rose-500",
    },
    Medium: {
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      dot: "bg-amber-500",
    },
    Low: {
      color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30",
      dot: "bg-sky-500",
    },
  };

  const category = categoryConfig[task.category] || categoryConfig.Study;
  const CategoryIcon = category.icon;
  const priority = priorityConfig[task.priority] || priorityConfig.Medium;

  return (
    <Card
      className={cn(
        "group relative rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden",
        task.completed
          ? "bg-card/60 border-border/60 opacity-80"
          : isOverdue
            ? "bg-card border-rose-500/30 shadow-xs shadow-rose-500/5"
            : "bg-card border-border shadow-xs"
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category Badge */}
            <Badge
              variant="outline"
              className={cn("text-[11px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1", category.color)}
            >
              <CategoryIcon className="w-3 h-3" />
              {task.category}
            </Badge>

            {/* Priority Badge */}
            <Badge
              variant="outline"
              className={cn("text-[11px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1.5", priority.color)}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", priority.dot)} />
              {task.priority}
            </Badge>

            {/* Overdue / Due Today Badge */}
            {isOverdue && (
              <Badge className="bg-rose-500 text-white text-[10px] py-0 px-1.5">
                <Clock className="w-2.5 h-2.5 mr-1" />
                Overdue
              </Badge>
            )}
            {isDueToday && (
              <Badge className="bg-amber-500 text-white text-[10px] py-0 px-1.5">
                Due Today
              </Badge>
            )}
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-text-muted hover:text-primary rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
              }}
              title="Edit Task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-text-muted hover:text-violet-500 rounded-lg"
              onClick={handleShare}
              title="Share Task Link"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-text-muted hover:text-rose-500 rounded-lg"
              onClick={handleDelete}
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Task Title & Interactive Checkbox */}
        <div className="flex items-start gap-2.5 pt-0.5">
          <button
            type="button"
            onClick={handleToggle}
            className="mt-0.5 text-text-muted hover:text-primary transition-colors focus:outline-hidden"
            title={task.completed ? "Mark Incomplete" : "Mark Complete"}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "text-sm font-semibold text-text leading-snug break-words transition-all cursor-pointer",
                task.completed && "line-through text-text-muted font-normal"
              )}
              onClick={handleToggle}
            >
              {task.title}
            </h4>

            {task.description && (
              <p
                className={cn(
                  "text-xs text-text-muted mt-1 leading-relaxed line-clamp-2 break-words",
                  task.completed && "line-through opacity-70"
                )}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer: Due Date & Created Date */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-text-muted">
          {task.dueDate ? (
            <div
              className={cn(
                "flex items-center gap-1 font-medium",
                isOverdue
                  ? "text-rose-500"
                  : isDueToday
                    ? "text-amber-500"
                    : "text-text-muted"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          ) : (
            <span className="text-[10px] text-text-muted/60">No due date</span>
          )}

          <span className="text-[10px] font-mono text-text-muted/60">
            {formatDate(task.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
