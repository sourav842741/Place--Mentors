import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle2, Calendar, Share2, Clock, Edit3 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toggleTask, deleteTask, shareTask } from '../../redux/tasksSlice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const TaskCard = ({ task, onEdit }) => {
  const dispatch = useDispatch();

  const categoryColors = {
    Study:
      'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    Job: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    Personal:
      'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800',
  };

  const priorityColors = {
    High: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    Medium:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    Low: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;

    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  const handleToggle = async () => {
    await dispatch(toggleTask(task._id));
  };

  const handleDelete = async () => {
    const ok = window.confirm('Delete this task?');
    if (!ok) return;

    await dispatch(deleteTask(task._id));
    toast.success('Task deleted');
  };

  const handleShare = async () => {
    try {
      await dispatch(shareTask(task._id));
    } catch (error) {
      // Toast handled in thunk
    }
  };

  return (
    <Card
      className={cn(
        'group h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-l-4',
        task.completed
          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
          : isOverdue
            ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
            : 'border-slate-300 dark:border-slate-700'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle
              className={cn(
                'text-lg font-bold leading-tight mb-2 break-words',
                task.completed && 'line-through opacity-70'
              )}
            >
              {task.title}
            </CardTitle>

            <CardDescription className="flex flex-wrap gap-2">
              <Badge className={cn('text-xs', categoryColors[task.category])}>
                {task.category}
              </Badge>

              <Badge className={cn('text-xs', priorityColors[task.priority])}>
                {task.priority}
              </Badge>

              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {task.description && (
          <p
            className={cn(
              'text-sm text-muted-foreground leading-relaxed break-words',
              task.completed && 'opacity-70'
            )}
          >
            {task.description}
          </p>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}

        <div className="border-t pt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(task.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>

          <div className="flex items-center gap-1 relative z-20">
            {/* Complete */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              title={task.completed ? 'Mark Pending' : 'Mark Complete'}
            >
              <CheckCircle2
                className={cn(
                  'w-4 h-4',
                  task.completed ? 'text-emerald-500' : 'text-muted-foreground'
                )}
              />
            </Button>

            {/* Edit */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(task);
              }}
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4 text-blue-500" />
            </Button>

            {/* Share */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              title="Share Task"
            >
              <Share2 className="w-4 h-4 text-violet-500" />
            </Button>

            {/* Delete */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
