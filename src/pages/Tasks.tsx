// src/pages/Tasks.tsx
import { useState } from "react";
import { Filter, X, Calendar, Plus } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useTasks } from "../hooks/task/useTasks";
import { useAddTaskUsingVoice } from "../hooks/task/useTaskMutations";
import TaskList from "../components/tasks/TaskList";
import TaskUpsertSheet from "../components/tasks/TaskUpsertSheet";
import TaskFilterSheet from "../components/tasks/TaskFilterSheet";
import { Task, TaskFilters, TaskStatus } from "../interfaces/task.interface";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { Mic } from "lucide-react";
import VoiceTaskModal from "../components/voice/VoiceTaskModal";

const Tasks = () => {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [openTaskSheet, setOpenTaskSheet] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openFilterSheet, setOpenFilterSheet] = useState(false);
  const [view, setView] = useState<"today" | "week" | "all">("today");
  const [openVoice, setOpenVoice] = useState(false);

  const createTaskUsingVoice = useAddTaskUsingVoice();

  const handleVoiceSend = async (text: string) => {
    if (text.trim()) {
      createTaskUsingVoice.mutate({ text });
    }
    setOpenVoice(false);
    
  };

  // Calculate date range based on view
  const getDateRange = () => {
    const today = new Date();
    switch (view) {
      case "today":
        return {
          from: format(today, "yyyy-MM-dd"),
          to: format(today, "yyyy-MM-dd"),
        };
      case "week":
        return {
          from: format(startOfWeek(today), "yyyy-MM-dd"),
          to: format(endOfWeek(today), "yyyy-MM-dd"),
        };
      default:
        return { from: undefined, to: undefined };
    }
  };

  const { from, to } = getDateRange();
  const { data, isLoading, isFetching } = useTasks(from, to);

  // Filter tasks based on filters
  const filteredTasks = (data?.data || []).filter((task) => {
    // Status filter
    if (filters.status && task.status !== filters.status) return false;

    // Search filter
    if (
      filters.search &&
      !task.title.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Date filter (FROM / TO)
    if (filters.from || filters.to) {
      const taskDate = new Date(task.dueDateTime);

      if (filters.from) {
        const fromDate = new Date(filters.from);
        fromDate.setHours(0, 0, 0, 0);

        if (taskDate < fromDate) return false;
      }

      if (filters.to) {
        const toDate = new Date(filters.to);
        toDate.setHours(23, 59, 59, 999);

        if (taskDate > toDate) return false;
      }
    }

    return true;
  });


  const hasActiveFilters = filters.search || filters.status;

  const clearAllFilters = () => {
    setFilters({});
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setOpenTaskSheet(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setOpenTaskSheet(true);
  };

  // Group tasks by status
  const groupedTasks = {
    pending: filteredTasks.filter((t) => t.status === TaskStatus.Pending),
    inProgress: filteredTasks.filter((t) => t.status === TaskStatus.InProgress),
    completed: filteredTasks.filter((t) => t.status === TaskStatus.Completed),
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded-lg border">
        {/* HEADER */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">
            <div>
              <h1 className="text-4xl font-serif font-semibold text-slate-900">
                Tasks
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {filteredTasks.length} tasks
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenVoice(true)}
                className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                <Mic size={16} />
                Voice
              </button>

              <button
                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 transition"
                onClick={handleAddTask}
              >
                <Plus size={18} />
                Add Task
              </button>
            </div>


            {/* VIEW SELECTOR */}
            <div className="flex gap-2">
              <button
                onClick={() => setView("today")}
                className={`px-4 py-2 rounded text-sm font-medium transition ${view === "today"
                  ? "bg-blue-900 text-white"
                  : "bg-white border hover:bg-slate-50"
                  }`}
              >
                Today
              </button>
              <button
                onClick={() => setView("week")}
                className={`px-4 py-2 rounded text-sm font-medium transition ${view === "week"
                  ? "bg-blue-900 text-white"
                  : "bg-white border hover:bg-slate-50"
                  }`}
              >
                This Week
              </button>
              <button
                onClick={() => setView("all")}
                className={`px-4 py-2 rounded text-sm font-medium transition ${view === "all"
                  ? "bg-blue-900 text-white"
                  : "bg-white border hover:bg-slate-50"
                  }`}
              >
                All Tasks
              </button>
            </div>

            {/* FILTER + SEARCH */}
            <div className="flex justify-end gap-2">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50"
                >
                  <X size={14} />
                  Clear
                </button>
              )}

              <button
                onClick={() => setOpenFilterSheet(true)}
                className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                <Filter size={16} />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* TASK LISTS - KANBAN STYLE */}
        <div className="grid grid-cols-3 gap-4 p-4">
          {/* PENDING */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">
                Pending ({groupedTasks.pending.length})
              </h3>
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
            </div>
            <TaskList
              tasks={groupedTasks.pending}
              loading={isLoading || isFetching}
              onEdit={handleEditTask}
            />
          </div>

          {/* IN PROGRESS */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">
                In Progress ({groupedTasks.inProgress.length})
              </h3>
              <div className="w-3 h-3 rounded-full bg-blue-500" />
            </div>
            <TaskList
              tasks={groupedTasks.inProgress}
              loading={isLoading || isFetching}
              onEdit={handleEditTask}
            />
          </div>

          {/* COMPLETED */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">
                Completed ({groupedTasks.completed.length})
              </h3>
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <TaskList
              tasks={groupedTasks.completed}
              loading={isLoading || isFetching}
              onEdit={handleEditTask}
            />
          </div>
        </div>
      </div>

      {/* FILTER SHEET */}
      <TaskFilterSheet
        open={openFilterSheet}
        onClose={() => setOpenFilterSheet(false)}
        filters={filters}
        onApply={setFilters}
        onClear={clearAllFilters}
      />

      {/* TASK UPSERT SHEET */}
      <TaskUpsertSheet
        open={openTaskSheet}
        onClose={() => {
          setOpenTaskSheet(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      <VoiceTaskModal
        open={openVoice}
        onClose={() => setOpenVoice(false)}
        onSendText={handleVoiceSend}
      />


    </>
  );
};

export default Tasks;