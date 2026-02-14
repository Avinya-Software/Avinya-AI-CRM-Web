// src/components/tasks/TaskList.tsx
import { useState } from "react";
import { Check, Edit, Repeat, Loader2, Calendar } from "lucide-react";
import { Task, TaskStatus } from "../../interfaces/task.interface";
import { useUpdateTask } from "../../hooks/task/useTaskMutations";
import { format, isPast } from "date-fns";
import TaskDetailModal from "./TaskDetailModal";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
}

const TaskList = ({ tasks, loading, onEdit }: TaskListProps) => {
  const updateTask = useUpdateTask();
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const handleToggleComplete = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation(); // prevent opening detail modal
    const newStatus =
      task.status === TaskStatus.Completed
        ? TaskStatus.Pending
        : TaskStatus.Completed;

    updateTask.mutate({
      occurrenceId: task.occurrenceId,
      data: {
        dueDateTime: task.dueDateTime,
        status: newStatus,
      },
    });
  };

  const handleEditClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation(); // prevent opening detail modal
    onEdit(task);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        No tasks here
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
        {tasks.map((task) => {
          const dueDate = new Date(task.dueDateTime);
          const isOverdue =
            isPast(dueDate) && task.status !== TaskStatus.Completed;

          return (
            <div
              key={task.occurrenceId}
              onClick={() => setDetailTask(task)}
              className="bg-white rounded-lg p-3 border hover:shadow-md hover:border-blue-200 transition group cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                {/* CHECKBOX */}
                <button
                  onClick={(e) => handleToggleComplete(e, task)}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${task.status === TaskStatus.Completed
                    ? "bg-green-500 border-green-500"
                    : "border-slate-300 hover:border-blue-500"
                    }`}
                >
                  {task.status === TaskStatus.Completed && (
                    <Check size={14} className="text-white" />
                  )}
                </button>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm ${task.status === TaskStatus.Completed
                      ? "line-through text-slate-400"
                      : "text-slate-900"
                      }`}
                  >
                    {task.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                    <div
                      className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-medium" : ""
                        }`}
                    >
                      <Calendar size={12} />
                      {format(dueDate, "MMM dd, h:mm a")}
                    </div>

                    {task.isRecurring && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Repeat size={12} />
                        Recurring
                      </div>
                    )}
                  </div>
                </div>

                {/* EDIT BUTTON */}
                <button
                  onClick={(e) => handleEditClick(e, task)}
                  className="sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                  title="Edit task"
                >
                  <Edit size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL MODAL */}
      <TaskDetailModal
        open={!!detailTask}
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onEdit={(task) => {
          setDetailTask(null);
          onEdit(task);
        }}
      />
    </>
  );
};

export default TaskList;