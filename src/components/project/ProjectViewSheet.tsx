// src/components/project/ProjectViewSheet.tsx
import { useState } from "react";
import { X, Edit2, Plus, Clock, CheckSquare, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { useProjectById } from "../../hooks/project/useProjectById";
import type { Project } from "../../interfaces/project.interface";
import Spinner from "../common/Spinner";
import { useCreateTask } from "../../hooks/task/useTaskMutations";
import { useGetTeamsDropdown } from "../../hooks/team/useTeamMutation";
import { Users } from "lucide-react";

const STATUS_LABEL: Record<number, string> = {
  0: "Planning", 1: "Active", 2: "Completed", 3: "On Hold",
};
const STATUS_STYLE: Record<number, string> = {
  0: "bg-slate-100 text-slate-600",
  1: "bg-blue-100 text-blue-700",
  2: "bg-green-100 text-green-700",
  3: "bg-orange-100 text-orange-700",
};
const PRIORITY_LABEL: Record<number, string> = {
  0: "Low", 1: "Medium", 2: "High", 3: "Critical",
};
const PRIORITY_STYLE: Record<number, string> = {
  0: "bg-slate-100 text-slate-500",
  1: "bg-amber-100 text-amber-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-red-100 text-red-700",
};
const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-green-500",
  "bg-amber-500", "bg-red-500", "bg-pink-500",
];

interface Props {
  projectId: string;
  onClose: () => void;
  onEdit: (project: Project) => void;
}

const ProjectViewSheet = ({ projectId, onClose, onEdit }: Props) => {
  const [tab, setTab] = useState<"overview" | "tasks">("overview");
  const [showAddTask, setShowAddTask] = useState(false);

  const [taskForm, setTaskForm] = useState({
    taskName: "",
    description: "",
    dueDate: ""
  });

  const { data: project, isLoading } = useProjectById(projectId);
  const { mutate: addTask, isPending: addingTask } = useCreateTask();
  const { data: teamResponse } = useGetTeamsDropdown();
  console.log(project);
  // Find project's team name if a team is assigned
  const projectTeamName = project?.teamId
    ? teamResponse?.data?.find((t: any) => t.id === Number(project.teamId))?.name
    : undefined;



  const handleAddTask = () => {
    if (!taskForm.taskName.trim()) {
      toast.error("Task name is required");
      return;
    }
    if (!taskForm.dueDate) {
      toast.error("Due date is required");
      return;
    }

    addTask(
      {
        title: taskForm.taskName,
        description: taskForm.description,
        dueDateTime: new Date(taskForm.dueDate).toISOString(),
        isRecurring: false,
        scope: project.teamId ? "Team" : "Personal",
        teamId: project.teamId ? String(project.teamId) : undefined,
        recurrenceStartDate: null,
        recurrenceEndDate: null,
        reminderAt: undefined,
        reminderChannel: "NONE",
        projectId: projectId
      } as any, // Type assertion since CreateTaskDto might require properties absent here depending on strictness
      {
        onSuccess: () => {
          setShowAddTask(false);
          setTaskForm({ taskName: "", description: "", dueDate: "" });
          toast.success("Task added");
        },
        onError: () => toast.error("Failed to add task"),
      }
    );
  };

  if (isLoading || !project) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 flex items-center gap-3 shadow-2xl">
          <Loader2 className="animate-spin text-blue-600" size={20} />
          <span className="text-slate-600 text-sm">Loading project...</span>
        </div>
      </div>
    );
  }

  const tasks = project.tasks ?? [];
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === "Pending").length,
    active: tasks.filter(t => t.status === "InProgress").length,
    done: tasks.filter(t => t.status === "Completed").length,
  };

  return (
    <>
      {/* OVERLAY */}
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      {/* SHEET */}
      <div className="fixed top-0 right-0 h-screen w-[580px] bg-white z-[60] shadow-2xl flex flex-col">

        {/* HEADER */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-4">
              <h2 className="text-lg font-bold text-slate-800 leading-snug">
                {project.projectName}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">{project.clientName || "—"}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[project.status ?? 0]}`}>
              {STATUS_LABEL[project.status ?? 0]}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLE[project.priority ?? 1]}`}>
              {PRIORITY_LABEL[project.priority ?? 1]}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-100">
          {(["overview", "tasks"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors capitalize ${tab === t
                ? "text-blue-700 border-b-2 border-blue-600"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {t === "tasks" ? `Tasks (${taskStats.total})` : "Overview"}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto">

          {/* ── OVERVIEW TAB ── */}
          {tab === "overview" && (
            <div className="p-5 space-y-5">

              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-500">Overall Progress</span>
                  <span className="font-bold text-slate-800">{project.progressPercent ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${project.progressPercent ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description
                  </p>
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {project.projectManagerName && (
                  <InfoCard label="Project Manager" value={project.projectManagerName} />
                )}
                {project.location && (
                  <InfoCard label="Location" value={project.location} />
                )}
                {project.estimatedValue != null && (
                  <InfoCard
                    label="Estimated Value"
                    value={`₹${Number(project.estimatedValue).toLocaleString("en-IN")}`}
                  />
                )}
                {project.deadline && (
                  <InfoCard
                    label="Deadline"
                    value={new Date(project.deadline).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  />
                )}
              </div>

              {/* Team Members */}
              {(project.teamMembers ?? []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Team Members ({project.teamMembers!.length})
                  </p>
                  <div className="space-y-2">
                    {project.teamMembers!.map((m, i) => {
                      const initials = m.userName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                      return (
                        <div key={m.userId} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{m.userName}</p>
                            {m.role && <p className="text-xs text-slate-400">{m.role}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {(project.startDate || project.endDate) && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Timeline
                  </p>
                  <div className="bg-slate-50 rounded-lg divide-y divide-slate-200">
                    {project.startDate && (
                      <div className="flex justify-between items-center px-3 py-2.5">
                        <span className="text-sm text-slate-500">Start Date</span>
                        <span className="text-sm font-medium text-slate-700">
                          {new Date(project.startDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {project.endDate && (
                      <div className="flex justify-between items-center px-3 py-2.5">
                        <span className="text-sm text-slate-500">End Date</span>
                        <span className="text-sm font-medium text-slate-700">
                          {new Date(project.endDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TASKS TAB ── */}
          {tab === "tasks" && (
            <div className="p-5">
              {/* Task Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "Total", value: taskStats.total, color: "text-slate-700" },
                  { label: "To Do", value: taskStats.todo, color: "text-slate-500" },
                  { label: "Active", value: taskStats.active, color: "text-blue-600" },
                  { label: "Done", value: taskStats.done, color: "text-green-600" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="w-full py-2.5 bg-blue-900 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-800 transition mb-4"
              >
                <Plus size={16} /> Add Task
              </button>

              {/* Add Task Form */}
              {showAddTask && (
                <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-4 border border-slate-200">

                  {/* Title */}
                  <div>
                    <input
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="Task name *"
                      value={taskForm.taskName}
                      onChange={e => setTaskForm({ ...taskForm, taskName: e.target.value })}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <input
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      placeholder="Description (optional)"
                      value={taskForm.description}
                      onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                    />
                  </div>

                  {/* Team Context */}
                  {projectTeamName && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Team</label>
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-100/50 border border-slate-200 rounded-lg text-sm text-slate-600">
                        <Users size={14} className="text-slate-400" />
                        {projectTeamName}
                      </div>
                    </div>
                  )}

                  {/* Due Date */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Due Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      value={taskForm.dueDate}
                      onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setShowAddTask(false)}
                      className="flex-1 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-100 transition bg-white"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!taskForm.taskName.trim() || !taskForm.dueDate || addingTask}
                      onClick={handleAddTask}
                      className="flex-1 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                      {addingTask && <Spinner />}
                      {addingTask ? "Adding..." : "Add Task"}
                    </button>
                  </div>
                </div>
              )}

              {/* Task List */}
              {tasks.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <CheckSquare size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.occurrenceId} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${task.status === "Completed" ? "bg-green-500" :
                        task.status === "InProgress" ? "bg-blue-500" : "bg-slate-300"
                        }`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.status === "Completed" ? "line-through text-slate-400" : "text-slate-700"}`}>
                          {task.title}
                        </p>
                        {task.dueDateTime && (
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(task.dueDateTime).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${task.status === "Completed" ? "bg-green-100 text-green-700" :
                        task.status === "InProgress" ? "bg-blue-100 text-blue-700" :
                          "bg-slate-100 text-slate-500"
                        }`}>
                        {task.status === "Completed" ? "Done" : task.status === "InProgress" ? "Active" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-4 border-t border-slate-100">
          <button
            onClick={() => { onClose(); setTimeout(() => onEdit(project), 100); }}
            className="w-full py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition"
          >
            <Edit2 size={14} /> Edit Project
          </button>
        </div>
      </div>
    </>
  );
};

export default ProjectViewSheet;

/*   HELPER   */
const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
    <p className="text-xs text-slate-400 mb-1">{label}</p>
    <p className="text-sm font-semibold text-slate-700">{value}</p>
  </div>
);