// src/components/tasks/TaskDetailModal.tsx
import { X, Calendar, Clock, Repeat, CheckCircle2, Circle, Edit2, AlertCircle } from "lucide-react";
import { Task, TaskStatus } from "../../interfaces/task.interface";
import { format, isPast, formatDistanceToNow } from "date-fns";

interface TaskDetailModalProps {
    open: boolean;
    onClose: () => void;
    task: Task | null;
    onEdit: (task: Task) => void;
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string; dot: string }> = {
    [TaskStatus.Pending]: {
        label: "Pending",
        color: "text-amber-700",
        bg: "bg-amber-50 border-amber-200",
        dot: "bg-amber-400",
    },
    [TaskStatus.InProgress]: {
        label: "In Progress",
        color: "text-blue-700",
        bg: "bg-blue-50 border-blue-200",
        dot: "bg-blue-400",
    },
    [TaskStatus.Completed]: {
        label: "Completed",
        color: "text-green-700",
        bg: "bg-green-50 border-green-200",
        dot: "bg-green-400",
    },
    [TaskStatus.Cancelled]: {
        label: "Cancelled",
        color: "text-slate-500",
        bg: "bg-slate-100 border-slate-200",
        dot: "bg-slate-400",
    },
};

const TaskDetailModal = ({ open, onClose, task, onEdit }: TaskDetailModalProps) => {
    if (!open || !task) return null;

    const dueDate = new Date(task.dueDateTime);
    const isOverdue = isPast(dueDate) && task.status !== TaskStatus.Completed;
    const isCompleted = task.status === TaskStatus.Completed;
    const status = statusConfig[task.status] ?? statusConfig[TaskStatus.Pending];

    const handleEditClick = () => {
        onClose();
        onEdit(task);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Colored top bar based on status */}
                {/* <div
          className={`h-1.5 w-full ${
            isCompleted
              ? "bg-green-400"
              : isOverdue
              ? "bg-red-400"
              : "bg-blue-400"
          }`}
        /> */}

                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-5 pb-4">
                    <div className="flex items-center gap-2.5">
                        {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : isOverdue ? (
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        ) : (
                            <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                        )}
                        <span className="text-xs font-semibold tracking-widest uppercase text-slate-400">
                            Task Details
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition text-slate-400 hover:text-slate-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 pb-6 space-y-5">

                    {/* Title */}
                    <div>
                        <p
                            className={`text-lg font-semibold leading-snug ${isCompleted ? "line-through text-slate-400" : "text-slate-800"
                                }`}
                        >
                            {task.title}
                        </p>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3">

                        {/* Due Date */}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1.5">
                                <Calendar size={12} />
                                Due Date
                            </div>
                            <p className={`text-sm font-semibold ${isOverdue ? "text-red-600" : "text-slate-700"}`}>
                                {format(dueDate, "MMM dd, yyyy")}
                            </p>
                            <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-400" : "text-slate-400"}`}>
                                {format(dueDate, "h:mm a")}
                            </p>
                        </div>

                        {/* Status */}
                        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1.5">
                                <Clock size={12} />
                                Status
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${status.bg} ${status.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                            </div>
                        </div>

                    </div>

                    {/* Time relative */}
                    <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm ${isOverdue
                            ? "bg-red-50 border border-red-100 text-red-600"
                            : isCompleted
                                ? "bg-green-50 border border-green-100 text-green-600"
                                : "bg-blue-50 border border-blue-100 text-blue-600"
                        }`}>
                        <Clock size={14} className="flex-shrink-0" />
                        <span className="font-medium">
                            {isCompleted
                                ? "Task completed"
                                : isOverdue
                                    ? `Overdue by ${formatDistanceToNow(dueDate)}`
                                    : `Due ${formatDistanceToNow(dueDate, { addSuffix: true })}`}
                        </span>
                    </div>

                    {/* Recurring badge */}
                    {task.isRecurring && (
                        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-purple-50 border border-purple-100 rounded-xl">
                            <Repeat size={14} className="text-purple-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-purple-700">
                                This is a recurring task
                            </span>
                        </div>
                    )}

                    {/* Occurrence ID (subtle) */}
                    <p className="text-xs text-slate-300 text-right">
                        ID #{task.occurrenceId}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm font-medium text-slate-600"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleEditClick}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <Edit2 size={14} />
                            Edit Task
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;