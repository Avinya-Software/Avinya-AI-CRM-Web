// src/pages/Tasks.tsx
import { useState, useEffect } from "react";
import { Filter, X, Plus, Mic, User, Users } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useTasks } from "../hooks/task/useTasks";
import { useAddTaskUsingVoice } from "../hooks/task/useTaskMutations";
import TaskList from "../components/tasks/TaskList";
import TaskUpsertSheet from "../components/tasks/TaskUpsertSheet";
import TaskFilterSheet from "../components/tasks/TaskFilterSheet";
import { Task, TaskFilters, TaskStatus } from "../interfaces/task.interface";
import dayjs from "dayjs";
import VoiceTaskModal from "../components/voice/VoiceTaskModal";
import { useIsMutating } from "@tanstack/react-query";
import { usePermissions } from "../context/PermissionContext";

type TaskScope = "Personal" | "Team";

const Tasks = () => {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [openTaskSheet, setOpenTaskSheet] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openFilterSheet, setOpenFilterSheet] = useState(false);
  const [view, setView] = useState<"today" | "week" | "all">("week");
  const [openVoice, setOpenVoice] = useState(false);
  const [scope, setScope] = useState<TaskScope>("Personal");

  /* ── PERMISSIONS ── */
  const { hasPermission } = usePermissions();
  const canAddTask = hasPermission("task", "add");
  const canEditTask = hasPermission("task", "edit");

  const isMutating = useIsMutating();
  const voiceTaskMutation = useAddTaskUsingVoice();
  const isVoiceLoading = voiceTaskMutation.isPending;

  const handleVoiceSend = async (text: string) => {
    if (text.trim()) {
      voiceTaskMutation.mutate(
        { text },
        { onSuccess: refreshTasks }
      );
    }
    setOpenVoice(false);
  };

  const getDateRange = () => {
    switch (view) {
      case "today":
        return {
          from: dayjs().startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
          to: dayjs().endOf("day").format("YYYY-MM-DDTHH:mm:ss"),
        };

      case "week":
        return {
          from: dayjs().startOf("week").add(1, "day").format("YYYY-MM-DDTHH:mm:ss"), // Monday
          to: dayjs().endOf("week").add(1, "day").format("YYYY-MM-DDTHH:mm:ss"), // Sunday
        };

      default:
        return { from: undefined, to: undefined };
    }
  };

  const { from, to } = getDateRange();

  const tasksMutation = useTasks();
  const personalTasksMutation = useTasks();
  const teamTasksMutation = useTasks();

  useEffect(() => {
    tasksMutation.mutate({ from, to, scope });
  }, [from, to, scope]);

  useEffect(() => {
    personalTasksMutation.mutate({ from, to, scope: "Personal" });
  }, [from, to]);

  useEffect(() => {
    teamTasksMutation.mutate({ from, to, scope: "Team" });
  }, [from, to]);

  const { data, isPending: isLoading } = tasksMutation;
  const { data: personalData } = personalTasksMutation;
  const { data: teamData } = teamTasksMutation;

  const filteredTasks = (data?.data || []).filter((task) => {
    if (filters.status && task.status !== filters.status) return false;
    if (
      filters.search &&
      !task.title.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false;

    if (filters.from || filters.to) {
      const taskDate = dayjs(task.dueDateTime);
      if (filters.from) {
        const fromDate = dayjs(filters.from).startOf("day");
        if (taskDate.isBefore(fromDate)) return false;
      }
      if (filters.to) {
        const toDate = dayjs(filters.to).endOf("day");
        if (taskDate.isAfter(toDate)) return false;
      }
    }
    return true;
  });

  const hasActiveFilters = filters.search || filters.status;
  const clearAllFilters = () => setFilters({});

  const handleAddTask = () => {
    setSelectedTask(null);
    setOpenTaskSheet(true);
  };

  const handleEditTask = (task: Task) => {
    // Only open edit sheet if user has edit permission
    if (!canEditTask) return;
    setSelectedTask(task);
    setOpenTaskSheet(true);
  };

  const groupedTasks = {
    pending: filteredTasks.filter((t) => t.status === TaskStatus.Pending),
    inProgress: filteredTasks.filter((t) => t.status === TaskStatus.InProgress),
    completed: filteredTasks.filter((t) => t.status === TaskStatus.Completed),
  };

  const refreshTasks = () => {
    tasksMutation.mutate({ from, to, scope });
    personalTasksMutation.mutate({ from, to, scope: "Personal" });
    teamTasksMutation.mutate({ from, to, scope: "Team" });
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white rounded-lg border">
        {/* ── HEADER ── */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">

            <div>
              <h1 className="text-4xl font-serif font-semibold text-slate-900">
                Tasks
              </h1>

              <div className="mt-3 inline-flex bg-white border border-slate-200 rounded-lg p-0.5 gap-0.5">
                <button
                  onClick={() => setScope("Personal")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${scope === "Personal"
                    ? "btn-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  <User size={14} />
                  My Tasks
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold ${scope === "Personal"
                    ? "bg-white text-slate-500"
                    : "bg-slate-100 text-slate-500"
                    }`}>
                    {personalData?.data?.length ?? "—"}
                  </span>
                </button>

                <button
                  onClick={() => setScope("Team")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${scope === "Team"
                    ? "btn-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                >
                  <Users size={14} />
                  Team Tasks
                  <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-semibold ${scope === "Team"
                    ? "bg-white text-slate-500"
                    : "bg-slate-100 text-slate-500"
                    }`}>
                    {teamData?.data?.length ?? "—"}
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Voice + Add Task */}
            <div className="flex justify-end gap-2">

              {/* Voice button — only shown if user can add tasks */}
              {canAddTask && (
                <button
                  onClick={() => setOpenVoice(true)}
                  disabled={isVoiceLoading}
                  className={`inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition ${isVoiceLoading
                    ? "opacity-50 cursor-not-allowed bg-slate-100"
                    : "hover:bg-slate-50"
                    }`}
                >
                  <Mic size={16} />
                  {isVoiceLoading ? "Processing..." : "Voice"}
                </button>
              )}

              {/* Add Task button — only shown if user can add tasks */}
              {canAddTask && (
                <button
                  className="inline-flex items-center gap-2 btn-primary px-4 py-2 rounded text-sm font-medium transition"
                  onClick={handleAddTask}
                >
                  <Plus size={18} />
                  {scope === "Team" ? "Add Team Task" : "Add Task"}
                </button>
              )}
            </div>

            {/* View selector */}
            <div className="flex gap-2">
              {(["today", "week", "all"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded text-sm font-medium transition capitalize ${view === v
                    ? "btn-primary"
                    : "bg-white border hover:bg-slate-50"
                    }`}
                >
                  {v === "today" ? "Today" : v === "week" ? "This Week" : "All Tasks"}
                </button>
              ))}
            </div>

            {/* Filter + Search */}
            <div className="flex justify-end gap-2">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder={`Search ${scope === "Team" ? "team " : ""}tasks...`}
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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

        {/* ── SCOPE CONTEXT BANNER ── */}
        {scope === "Team" && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-100 text-sm text-blue-700">
            <Users size={14} className="flex-shrink-0" />
            <span>
              Showing tasks visible to your entire team. Everyone on the team
              can see and update these tasks.
            </span>
          </div>
        )}

        {/* ── KANBAN BOARD ── */}
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
              loading={isLoading || isMutating > 0}
              onEdit={canEditTask ? handleEditTask : undefined}
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
              loading={isLoading || isMutating > 0}
              onEdit={canEditTask ? handleEditTask : undefined}
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
              loading={isLoading || isMutating > 0}
              onEdit={canEditTask ? handleEditTask : undefined}
            />
          </div>
        </div>
      </div>

      {/* ── MODALS / SHEETS ── */}
      <TaskFilterSheet
        open={openFilterSheet}
        onClose={() => setOpenFilterSheet(false)}
        filters={filters}
        onApply={setFilters}
        onClear={clearAllFilters}
      />

      <TaskUpsertSheet
        open={openTaskSheet}
        onClose={() => {
          setOpenTaskSheet(false);
          setSelectedTask(null);
        }}
        onSuccess={refreshTasks}
        task={selectedTask}
        scope={scope}
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