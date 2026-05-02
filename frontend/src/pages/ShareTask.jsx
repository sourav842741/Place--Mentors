import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Calendar,
  BookOpen,
  Briefcase,
  User,
  ExternalLink,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import * as taskApi from "../services/taskApi";

const ShareTask = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSharedTask();
  }, [shareId]);

  const fetchSharedTask = async () => {
    try {
      setLoading(true);
      const response = await taskApi.getPublicTask(shareId);
      setTask(response.data);
    } catch (error) {
      toast.error("Task not found or has been deleted");
      navigate("/dashboard/tasks");
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryIcon = {
    Study: BookOpen,
    Job: Briefcase,
    Personal: User,
  };

  const Icon = categoryIcon[task?.category];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pt-16 md:pl-64 p-8 min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-gray-950 dark:to-gray-900">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!task) {
    return null;
  }

  const categoryColors = {
    Study: "bg-gradient-to-r from-purple-500 to-indigo-500",
    Job: "bg-gradient-to-r from-emerald-500 to-teal-500",
    Personal: "bg-gradient-to-r from-pink-500 to-rose-500",
  };

  const priorityColors = {
    High: "ring-red-500/30 bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    Medium:
      "ring-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
    Low: "ring-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800",
  };

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  return (
    <>
      <Navbar />
      <div className="pt-16 md:pl-64 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl ${categoryColors[task.category] || "bg-gray-500"} shadow-lg`}
              >
                {Icon && <Icon className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300 mb-1">
                  {task.title}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "font-medium text-sm px-3 py-1 shadow-md",
                      priorityColors[task.priority] || "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    {task.priority}
                  </Badge>
                  {task.completed ? (
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                      ✅ Completed
                    </Badge>
                  ) : isOverdue ? (
                    <Badge variant="destructive">⏰ Overdue</Badge>
                  ) : (
                    <Badge variant="secondary">⏳ Pending</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button onClick={copyShareLink} className="gap-2">
              <Share2 className="w-4 h-4" />
              {copied ? "Copied!" : "Share"}
            </Button>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div
              className={cn(
                "p-8 border-b",
                categoryColors[task.category] || "bg-gradient-to-r from-gray-900 to-gray-800",
                "text-white"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Category</p>
                  <p className="text-lg font-semibold capitalize">{task.category}</p>
                </div>
                <Badge className="text-white bg-white/20 backdrop-blur-sm border-white/30">
                  Shared via Place Mentor
                </Badge>
              </div>
            </div>

            <CardContent className="p-8 space-y-6">
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {task.dueDate && (
                  <div
                    className={cn(
                      "space-y-2 p-4 rounded-xl border",
                      isOverdue
                        ? "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
                        : "border-border bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </div>
                    <p className="text-xl font-semibold">{formatDate(task.dueDate)}</p>
                    {isOverdue && (
                      <Badge variant="destructive" className="mt-2">
                        Overdue
                      </Badge>
                    )}
                  </div>
                )}

                {/* Status */}
                <div className="space-y-2 p-4 rounded-xl border bg-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    Status
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm",
                        task.completed
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200 border-gray-200 dark:border-gray-700"
                      )}
                    >
                      {task.completed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 text-gray-500" />
                          Pending
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>Created: {formatDate(task.createdAt)}</span>
                <span>•</span>
                <span>Last updated: {formatDate(task.updatedAt)}</span>
                <div className="ml-auto flex gap-2">
                  <Button variant="outline" onClick={copyShareLink} size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/dashboard/tasks")}
                    size="sm"
                  >
                    View All Tasks
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ShareTask;
