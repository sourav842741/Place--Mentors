import React, { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const TaskForm = ({ task = null, onSuccess, isOpen = false, onClose }) => {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Study",
    priority: "Medium",
    dueDate: null,
  });
  const [dueDate, setDueDate] = useState(null);

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        category: task.category || "Study",
        priority: task.priority || "Medium",
        dueDate: task.dueDate,
      });
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    } else if (!isOpen) {
      // Reset form when closed
      setFormData({
        title: "",
        description: "",
        category: "Study",
        priority: "Medium",
        dueDate: null,
      });
      setDueDate(null);
    }
  }, [task, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    startTransition(() => {
      onSuccess({
        ...formData,
        dueDate: dueDate ? dueDate.toISOString() : null,
      });
    });
  };

  const categoryColors = {
    Study: "ring-purple-500 shadow-purple-200",
    Job: "ring-emerald-500 shadow-emerald-200",
    Personal: "ring-pink-500 shadow-pink-200",
  };

  const priorityColors = {
    High: "ring-red-500 shadow-red-200 text-destructive",
    Medium: "ring-amber-500 shadow-amber-200 text-foreground",
    Low: "ring-sky-500 shadow-sky-200 text-foreground",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="What needs to be done?"
          className="h-12 text-lg"
          disabled={isPending}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Add more details about this task..."
          rows={3}
          disabled={isPending}
        />
      </div>

      {/* Category & Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            disabled={isPending}
          >
            <SelectTrigger className={cn("w-full h-12", categoryColors[formData.category])}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Study">📚 Study</SelectItem>
              <SelectItem value="Job">💼 Job</SelectItem>
              <SelectItem value="Personal">❤️ Personal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
            disabled={isPending}
          >
            <SelectTrigger className={cn("w-full h-12", priorityColors[formData.priority])}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">🟦 Low</SelectItem>
              <SelectItem value="Medium">🟨 Medium</SelectItem>
              <SelectItem value="High">🔴 High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Due Date - Full Width */}
      <div className="space-y-2">
        <Label>Due Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-12 justify-start text-left font-normal rounded-xl border-2",
                !dueDate && "text-muted-foreground"
              )}
              disabled={isPending}
            >
              <CalendarIcon className="mr-3 h-5 w-5" />
              {dueDate ? (
                format(dueDate, "PPP")
              ) : (
                <span className="text-muted-foreground">Pick a due date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-auto p-0 rounded-2xl border shadow-2xl z-[100]"
          >
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
              fromDate={new Date()}
              className="p-4"
              classNames={{
                months: "flex flex-col space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center text-sm font-semibold",
                caption_label: "text-base font-bold",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg hover:bg-muted",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-10 w-10 text-center text-sm p-0 relative",
                day: "h-10 w-10 p-0 font-normal rounded-xl hover:bg-primary/10",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                day_today: "ring-2 ring-primary/30",
                day_outside: "text-muted-foreground opacity-40",
                day_disabled: "text-muted-foreground opacity-30",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            disabled={isPending}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="flex-1 h-12 rounded-xl font-semibold shadow-lg hover:shadow-xl"
          disabled={isPending || !formData.title.trim()}
        >
          {isPending ? (
            <>
              <svg
                className="-ml-1 mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : task ? (
            "Update Task"
          ) : (
            "Create Task"
          )}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
