import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";

const TaskFilters = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  activeFiltersCount,
  clearFilters,
}) => {
  const categories = [
    { label: "All", value: "all" },
    { label: "Study", value: "Study" },
    { label: "Job", value: "Job" },
    { label: "Personal", value: "Personal" },
  ];

  const statuses = [
    { label: "All", value: "all" },
    { label: "Pending", value: "Pending" },
    { label: "Completed", value: "Completed" },
  ];

  const priorities = [
    { label: "All", value: "all" },
    { label: "Low", value: "Low" },
    { label: "Medium", value: "Medium" },
    { label: "High", value: "High" },
  ];

  const sorts = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Due Soon", value: "due-soon" },
  ];

  return (
    <div className="space-y-4">
      {/* Search + Top Controls */}
      <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />

          <Input
            placeholder="Search tasks by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 w-full"
          />

          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="w-3 h-3" />
              <span>{activeFiltersCount} active</span>
            </div>

            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Category */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Category
          </p>

          <Select
            value={categoryFilter || "all"}
            onValueChange={(val) =>
              setCategoryFilter(val === "all" ? "" : val)
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Status
          </p>

          <Select
            value={statusFilter || "all"}
            onValueChange={(val) =>
              setStatusFilter(val === "all" ? "" : val)
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All" />
            </SelectTrigger>

            <SelectContent>
              {statuses.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Priority
          </p>

          <Select
            value={priorityFilter || "all"}
            onValueChange={(val) =>
              setPriorityFilter(val === "all" ? "" : val)
            }
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="All" />
            </SelectTrigger>

            <SelectContent>
              {priorities.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Sort
          </p>

          <Select
            value={sortBy || "newest"}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Newest" />
            </SelectTrigger>

            <SelectContent>
              {sorts.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(categoryFilter || statusFilter || priorityFilter) && (
        <div className="flex flex-wrap gap-2 pt-2">
          {categoryFilter && (
            <Badge variant="secondary">
              Category: {categoryFilter}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setCategoryFilter("")}
              />
            </Badge>
          )}

          {statusFilter && (
            <Badge variant="secondary">
              Status: {statusFilter}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setStatusFilter("")}
              />
            </Badge>
          )}

          {priorityFilter && (
            <Badge variant="secondary">
              Priority: {priorityFilter}
              <X
                className="w-3 h-3 ml-1 cursor-pointer"
                onClick={() => setPriorityFilter("")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;