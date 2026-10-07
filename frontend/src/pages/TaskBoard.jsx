import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  ListTodo,
  Columns,
  LayoutGrid,
  RefreshCw,
  Search,
  X,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  Briefcase,
  User,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import useTasks from "../hooks/useTasks";
import TaskStats from "../components/tasks/TaskStats";
import TaskCard from "../components/tasks/TaskCard";
import TaskForm from "../components/tasks/TaskForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Footer from "@/components/Footer";

// Starter Goal Templates for Students
const STARTER_TEMPLATES = [
  { title: "Solve 2 LeetCode Medium Problems", category: "Study", priority: "High" },
  { title: "Tailor Resume for SDE / Frontend Internships", category: "Job", priority: "High" },
  { title: "Revise Operating Systems & DBMS Core Topics", category: "Study", priority: "Medium" },
  { title: "Practice 1 Mock Behavioral Interview", category: "Job", priority: "Medium" },
  { title: "Solve Today's Coding POTD on PlaceMentor", category: "Study", priority: "High" },
];

const TaskBoard = () => {
  const { user } = useSelector((state) => state.user);

  const {
    tasks,
    stats,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    refetchTasks,
    refetchStats,
  } = useTasks();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' | 'grid'
  const [prefilledForm, setPrefilledForm] = useState(null);

  const [filters, setFilters] = useState({
    searchTerm: "",
    categoryFilter: "",
    statusFilter: "",
    priorityFilter: "",
    sortBy: "newest",
  });

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Search
    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Category
    if (filters.categoryFilter && filters.categoryFilter !== "all") {
      result = result.filter((t) => t.category === filters.categoryFilter);
    }

    // Status
    if (filters.statusFilter && filters.statusFilter !== "all") {
      if (filters.statusFilter === "Completed") {
        result = result.filter((t) => t.completed);
      } else if (filters.statusFilter === "Pending") {
        result = result.filter((t) => !t.completed);
      }
    }

    // Priority
    if (filters.priorityFilter && filters.priorityFilter !== "all") {
      result = result.filter((t) => t.priority === filters.priorityFilter);
    }

    // Sort
    switch (filters.sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "due-soon":
        result.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        });
        break;
      case "priority":
        const pOrder = { High: 1, Medium: 2, Low: 3 };
        result.sort((a, b) => (pOrder[a.priority] || 4) - (pOrder[b.priority] || 4));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [tasks, filters]);

  const activeFiltersCount = [
    filters.categoryFilter && filters.categoryFilter !== "all",
    filters.statusFilter && filters.statusFilter !== "all",
    filters.priorityFilter && filters.priorityFilter !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      categoryFilter: "",
      statusFilter: "",
      priorityFilter: "",
      sortBy: "newest",
    });
  };

  const handleCreateTask = async (formData) => {
    try {
      await createTask(formData);
      setShowCreateDialog(false);
      setPrefilledForm(null);
      refetchStats();
    } catch (error) {
      // Toast handled in thunk
    }
  };

  const handleUpdateTask = async (formData) => {
    try {
      await updateTask(editTask._id, formData);
      setShowEditDialog(false);
      setEditTask(null);
      refetchStats();
    } catch (error) {
      // Toast handled in thunk
    }
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setShowEditDialog(true);
  };

  const handleUseTemplate = (template) => {
    setPrefilledForm(template);
    setShowCreateDialog(true);
  };

  // Kanban Columns
  const pendingTasks = filteredTasks.filter((t) => !t.completed && t.priority !== "High");
  const urgentTasks = filteredTasks.filter((t) => !t.completed && t.priority === "High");
  const completedTasks = filteredTasks.filter((t) => t.completed);

  return (
    <>
      <Navbar />
      <div className="pt-20 lg:pt-20 lg:pl-64 px-3 sm:px-6 pb-12 bg-bg min-h-screen text-text transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto space-y-5">
          {/* Top Bar Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <ListTodo className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-text">Task Board</h1>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
                  </Badge>
                </div>
                <p className="text-xs text-text-muted">
                  Organize daily placement prep goals, interview revisions & deadlines
                </p>
              </div>
            </div>

            {/* Header Right Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* View Switcher */}
              <div className="flex items-center p-1 bg-muted/60 rounded-xl border border-border">
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    viewMode === "kanban"
                      ? "bg-card text-text shadow-xs font-semibold"
                      : "text-text-muted hover:text-text"
                  }`}
                  title="Kanban Board View"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    viewMode === "grid"
                      ? "bg-card text-text shadow-xs font-semibold"
                      : "text-text-muted hover:text-text"
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
              </div>

              {/* Refresh Button */}
              <Button
                onClick={() => {
                  refetchTasks();
                  refetchStats();
                }}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="h-9 px-3 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
                Sync
              </Button>

              {/* Create Task Button */}
              <Dialog
                open={showCreateDialog}
                onOpenChange={(open) => {
                  setShowCreateDialog(open);
                  if (!open) setPrefilledForm(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button className="h-9 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl">
                  <DialogHeader className="p-5 border-b border-border bg-card">
                    <DialogTitle className="text-xl font-bold text-text flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Create New Placement Task
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-5">
                    <TaskForm
                      task={prefilledForm}
                      isOpen={showCreateDialog}
                      onSuccess={handleCreateTask}
                      onClose={() => setShowCreateDialog(false)}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Compact Performance & KPI Ribbon */}
          <TaskStats />

          {/* Streamlined Filter & Search Toolbar */}
          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
                <Input
                  placeholder="Search tasks by title or keyword..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))
                  }
                  className="pl-9 pr-8 h-9 text-xs bg-muted/40 border-border focus:ring-1 focus:ring-primary rounded-xl"
                />
                {filters.searchTerm && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, searchTerm: "" }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Controls Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Priority Filter */}
                <Select
                  value={filters.priorityFilter || "all"}
                  onValueChange={(val) =>
                    setFilters((prev) => ({ ...prev, priorityFilter: val === "all" ? "" : val }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs px-3 min-w-[120px] rounded-xl bg-muted/40 border-border">
                    <SelectValue placeholder="Priority: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">🔴 High Priority</SelectItem>
                    <SelectItem value="Medium">🟡 Medium</SelectItem>
                    <SelectItem value="Low">🔵 Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                  value={filters.statusFilter || "all"}
                  onValueChange={(val) =>
                    setFilters((prev) => ({ ...prev, statusFilter: val === "all" ? "" : val }))
                  }
                >
                  <SelectTrigger className="h-9 text-xs px-3 min-w-[110px] rounded-xl bg-muted/40 border-border">
                    <SelectValue placeholder="Status: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">⏳ Pending</SelectItem>
                    <SelectItem value="Completed">✅ Completed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort By */}
                <Select
                  value={filters.sortBy || "newest"}
                  onValueChange={(val) => setFilters((prev) => ({ ...prev, sortBy: val }))}
                >
                  <SelectTrigger className="h-9 text-xs px-3 min-w-[110px] rounded-xl bg-muted/40 border-border">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="due-soon">Due Soonest</SelectItem>
                    <SelectItem value="priority">Priority First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>

                {/* Clear Filters Button if any active */}
                {(activeFiltersCount > 0 || filters.searchTerm) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 px-2.5 text-xs text-text-muted hover:text-text rounded-xl"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Category Chips Row */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-border/50">
              <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mr-1">
                Category:
              </span>
              {[
                { id: "all", label: "All Categories", count: tasks.length },
                {
                  id: "Study",
                  label: "Study",
                  icon: BookOpen,
                  count: tasks.filter((t) => t.category === "Study").length,
                  color: "text-purple-500",
                },
                {
                  id: "Job",
                  label: "Job Prep",
                  icon: Briefcase,
                  count: tasks.filter((t) => t.category === "Job").length,
                  color: "text-emerald-500",
                },
                {
                  id: "Personal",
                  label: "Personal",
                  icon: User,
                  count: tasks.filter((t) => t.category === "Personal").length,
                  color: "text-pink-500",
                },
              ].map((cat) => {
                const isActive =
                  (!filters.categoryFilter && cat.id === "all") ||
                  filters.categoryFilter === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        categoryFilter: cat.id === "all" ? "" : cat.id,
                      }))
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-muted/50 text-text-muted hover:bg-muted hover:text-text"
                    }`}
                  >
                    {Icon && <Icon className={`w-3 h-3 ${isActive ? "" : cat.color}`} />}
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-background/80 text-text-muted"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          {tasks.length === 0 ? (
            /* INSPIRING EMPTY STATE WITH QUICK-STARTER GOALS */
            <Card className="rounded-2xl border border-border bg-card shadow-xs">
              <CardContent className="py-12 sm:py-16 text-center max-w-2xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto shadow-xs">
                  <ListTodo className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-text">
                    Your Task Board is Ready
                  </h3>
                  <p className="text-sm text-text-muted max-w-md mx-auto">
                    Track daily coding goals, company applications, and revision deadlines to stay ahead in your placement journey.
                  </p>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-3">
                    🚀 Quick-Add Placement Prep Goals
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {STARTER_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleUseTemplate(tmpl)}
                        className="px-3 py-2 rounded-xl text-xs font-medium bg-muted/40 hover:bg-muted border border-border hover:border-primary/40 text-text transition-all flex items-center gap-2 text-left group shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5 text-primary group-hover:scale-125 transition-transform" />
                        <span>{tmpl.title}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                          {tmpl.category}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setPrefilledForm(null);
                      setShowCreateDialog(true);
                    }}
                    size="lg"
                    className="px-6 rounded-xl font-semibold shadow-xs"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : filteredTasks.length === 0 ? (
            /* NO RESULTS MATCHING FILTERS */
            <Card className="rounded-2xl border border-border bg-card">
              <CardContent className="py-16 text-center space-y-3">
                <Filter className="w-10 h-10 text-text-muted mx-auto opacity-50" />
                <h4 className="text-lg font-bold text-text">No tasks match your filters</h4>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Try adjusting or clearing your search term, category, or status filters.
                </p>
                <Button onClick={clearFilters} variant="outline" size="sm" className="mt-2">
                  Reset All Filters
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === "kanban" ? (
            /* KANBAN BOARD VIEW */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {/* Column 1: To Do / Pending */}
              <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-text">
                      To Do / Pending
                    </span>
                    <Badge variant="secondary" className="text-xs font-mono px-2 py-0">
                      {pendingTasks.length}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setPrefilledForm({ priority: "Medium" });
                      setShowCreateDialog(true);
                    }}
                    className="h-6 w-6 p-0 text-text-muted hover:text-text"
                    title="Add task in To Do"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {pendingTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-text-muted/60 border border-dashed border-border/60 rounded-xl">
                      No pending tasks
                    </div>
                  ) : (
                    pendingTasks.map((t) => (
                      <TaskCard key={t._id} task={t} onEdit={handleEditTask} />
                    ))
                  )}
                </div>
              </div>

              {/* Column 2: High Priority / Focus */}
              <div className="p-3.5 rounded-2xl bg-card border border-rose-500/20 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Urgent & Focus
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono px-2 py-0 bg-rose-500/10 text-rose-500 border border-rose-500/20"
                    >
                      {urgentTasks.length}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setPrefilledForm({ priority: "High" });
                      setShowCreateDialog(true);
                    }}
                    className="h-6 w-6 p-0 text-text-muted hover:text-rose-500"
                    title="Add Urgent task"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {urgentTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-text-muted/60 border border-dashed border-border/60 rounded-xl">
                      No urgent tasks pending 🎉
                    </div>
                  ) : (
                    urgentTasks.map((t) => (
                      <TaskCard key={t._id} task={t} onEdit={handleEditTask} />
                    ))
                  )}
                </div>
              </div>

              {/* Column 3: Completed */}
              <div className="p-3.5 rounded-2xl bg-card border border-emerald-500/20 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Completed
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono px-2 py-0 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    >
                      {completedTasks.length}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 min-h-[200px]">
                  {completedTasks.length === 0 ? (
                    <div className="p-6 text-center text-xs text-text-muted/60 border border-dashed border-border/60 rounded-xl">
                      No completed tasks yet
                    </div>
                  ) : (
                    completedTasks.map((t) => (
                      <TaskCard key={t._id} task={t} onEdit={handleEditTask} />
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* GRID CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard key={task._id} task={task} onEdit={handleEditTask} />
              ))}
            </div>
          )}

          {/* Edit Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl">
              <DialogHeader className="p-5 border-b border-border bg-card">
                <DialogTitle className="text-xl font-bold text-text">Edit Task</DialogTitle>
              </DialogHeader>
              <div className="p-5">
                <TaskForm
                  task={editTask}
                  isOpen={showEditDialog}
                  onSuccess={handleUpdateTask}
                  onClose={() => setShowEditDialog(false)}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TaskBoard;
