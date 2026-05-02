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
import { Plus } from "lucide-react";
import { toast } from "sonner";
import useTasks from "../hooks/useTasks";
import TaskStats from "../components/tasks/TaskStats";
import TaskCard from "../components/tasks/TaskCard";
import TaskForm from "../components/tasks/TaskForm";
import TaskFilters from "../components/tasks/TaskFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ListTodo, Filter, RefreshCw } from "lucide-react";
import Footer from "@/components/Footer";

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
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    searchTerm: "",
    categoryFilter: "",
    statusFilter: "",
    priorityFilter: "",
    sortBy: "newest",
  });

  // Filter and sort tasks
  const applyFilters = useCallback(
    (tasksList) => {
      let filtered = [...tasksList];

      // Search
      if (filters.searchTerm) {
        filtered = filtered.filter((task) =>
          task.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
        );
      }

      // Category
      if (filters.categoryFilter) {
        filtered = filtered.filter((task) => task.category === filters.categoryFilter);
      }

      // Status
      if (filters.statusFilter) {
        if (filters.statusFilter === "Completed") {
          filtered = filtered.filter((task) => task.completed);
        } else if (filters.statusFilter === "Pending") {
          filtered = filtered.filter((task) => !task.completed);
        }
      }

      // Priority
      if (filters.priorityFilter) {
        filtered = filtered.filter((task) => task.priority === filters.priorityFilter);
      }

      // Sort
      switch (filters.sortBy) {
        case "oldest":
          filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        case "due-soon":
          filtered.sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
          });
          break;
        case "newest":
        default:
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
      }

      return filtered;
    },
    [filters]
  );

  useEffect(() => {
    setFilteredTasks(applyFilters(tasks));
  }, [tasks, applyFilters]);

  const activeFiltersCount = [
    filters.categoryFilter,
    filters.statusFilter,
    filters.priorityFilter,
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
      toast.success("Task created successfully!");
      refetchStats();
    } catch (error) {
      // Error toast handled in thunk
    }
  };

  const handleUpdateTask = async (formData) => {
    try {
      await updateTask(editTask._id, formData);
      setShowEditDialog(false);
      setEditTask(null);
      toast.success("Task updated successfully!");
      refetchStats();
    } catch (error) {
      // Error toast handled in thunk
    }
  };

  const handleEditTask = (task) => {
    setEditTask(task);
    setShowEditDialog(true);
  };

  if (isLoading && tasks.length === 0) {
    return (
      <>
        <Navbar />
        <div className="pt-16 lg:pl-64 p-6 bg-gray-50 dark:bg-gray-950 min-h-screen ">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <TaskStats />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-24 lg:pl-64 px-4 md:px-8 pb-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-12 p-2 rounded-2xl bg-background/50 backdrop-blur-sm -mx-4 md:-mx-0 md:p-0">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <ListTodo className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                    Task Board
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Manage your Study, Job, and Personal tasks
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button onClick={refetchTasks} variant="outline" size="sm" disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="group">
                    <Plus className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-all duration-200" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl p-0">
                  <DialogHeader className="p-6 border-b">
                    <DialogTitle className="text-2xl font-bold">Create New Task</DialogTitle>
                  </DialogHeader>
                  <div className="p-6">
                    <TaskForm onSuccess={handleCreateTask} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <TaskStats />

          {/* Filters */}
          <Card className="mt-8 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Filters & Search
                {activeFiltersCount > 0 && (
                  <Badge className="text-xs">{activeFiltersCount} active</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <TaskFilters
                {...filters}
                activeFiltersCount={activeFiltersCount}
                setSearchTerm={(term) => setFilters((prev) => ({ ...prev, searchTerm: term }))}
                setCategoryFilter={(cat) =>
                  setFilters((prev) => ({ ...prev, categoryFilter: cat }))
                }
                setStatusFilter={(status) =>
                  setFilters((prev) => ({ ...prev, statusFilter: status }))
                }
                setPriorityFilter={(prio) =>
                  setFilters((prev) => ({ ...prev, priorityFilter: prio }))
                }
                setSortBy={(sort) => setFilters((prev) => ({ ...prev, sortBy: sort }))}
                clearFilters={clearFilters}
              />
            </CardContent>
          </Card>

          {/* Tasks Grid */}
          <div className="space-y-6">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="py-20 text-center">
                  <ListTodo className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {isLoading ? "Loading tasks..." : "No tasks found"}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {isLoading
                      ? "Fetching your tasks..."
                      : filters.searchTerm || activeFiltersCount > 0
                        ? "Try adjusting your filters or search terms"
                        : "Get started by creating your first task above."}
                  </p>
                  {!isLoading && (
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                      <DialogTrigger asChild>
                        <Button size="lg">
                          <Plus className="w-5 h-5 mr-2" />
                          Create First Task
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl p-0">
                        <DialogHeader className="p-6 border-b">
                          <DialogTitle className="text-2xl font-bold">Create New Task</DialogTitle>
                        </DialogHeader>
                        <div className="p-6">
                          <TaskForm onSuccess={handleCreateTask} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onEdit={() => handleEditTask(task)} />
                ))}
              </div>
            )}
          </div>

          {/* Edit Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl p-0">
              <DialogHeader className="p-6 border-b">
                <DialogTitle className="text-2xl font-bold">Edit Task</DialogTitle>
              </DialogHeader>
              <div className="p-6">
                <TaskForm task={editTask} onSuccess={handleUpdateTask} />
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
