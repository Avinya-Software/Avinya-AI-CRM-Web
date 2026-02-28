// src/components/project/ProjectTaskUpsertModal.tsx
import React, { useState, useEffect } from "react";
import { X, Save, Loader2, Calendar, Users } from "lucide-react";
import toast from "react-hot-toast";
import { useCreateTask } from "../../hooks/task/useTaskMutations";
import { Combobox, ComboboxOption } from "../../components/ui/combobox";

interface ProjectTaskUpsertModalProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    projectTeamId?: number | null;
    projectTeamName?: string;
    teamMembers?: { userId: string; userName: string; role?: string }[];
}

const ProjectTaskUpsertModal = ({
    open,
    onClose,
    projectId,
    projectTeamId,
    projectTeamName,
    teamMembers = [],
}: ProjectTaskUpsertModalProps) => {
    const addTask = useCreateTask();

    const [formData, setFormData] = useState({
        taskName: "",
        description: "",
        dueDate: "",
        assignedTo: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            const now = new Date();
            now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);

            setFormData({
                taskName: "",
                description: "",
                dueDate: now.toISOString().substring(0, 16),
                assignedTo: "",
            });
            setErrors({});
        }
    }, [open]);

    const assigneeOptions: ComboboxOption[] = teamMembers.map((m) => ({
        value: m.userId,
        label: m.userName,
    }));

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.taskName.trim()) newErrors.taskName = "Task name is required";
        if (!formData.dueDate) newErrors.dueDate = "Due date is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        addTask.mutate(
            {
                title: formData.taskName,
                description: formData.description,
                dueDateTime: new Date(formData.dueDate).toISOString(),
                isRecurring: false,
                scope: projectTeamId ? "Team" : "Personal",
                teamId: projectTeamId ? String(projectTeamId) : undefined,
                recurrenceStartDate: null,
                recurrenceEndDate: null,
                reminderAt: undefined,
                reminderChannel: "NONE",
                projectId: projectId,
                assignedToId: formData.assignedTo || undefined,
            } as any,
            {
                onSuccess: () => {
                    toast.success("Task added successfully");
                    onClose();
                },
                onError: () => toast.error("Failed to add task"),
            }
        );
    };

    const isLoading = addTask.isPending;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">Add New Task</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* TITLE */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.taskName}
                            onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.taskName ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-blue-500"
                                }`}
                            placeholder="What needs to be done?"
                        />
                        {errors.taskName && <p className="text-red-500 text-xs mt-1">{errors.taskName}</p>}
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            placeholder="Add more details..."
                        />
                    </div>

                    {/* TEAM (READ-ONLY CONTEXT) */}
                    {projectTeamName && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
                                <Users size={16} className="text-slate-400" />
                                {projectTeamName}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">This task is automatically linked to the project's team.</p>
                        </div>
                    )}

                    {/* ASSIGN TO (FROM PROJECT TEAM MEMBERS) */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To</label>
                        <Combobox
                            options={assigneeOptions}
                            value={formData.assignedTo}
                            onValueChange={(val) => setFormData({ ...formData, assignedTo: val })}
                            placeholder="Select team member..."
                            searchPlaceholder="Search members..."
                            emptyText={teamMembers.length ? "No members found." : "No team members on this project."}
                        />
                    </div>

                    {/* DUE DATE & TIME */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            <Calendar size={14} className="inline mr-1" />
                            Due Date & Time <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.dueDate ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-blue-500"
                                }`}
                        />
                        {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                    </div>

                    {/* SUBMIT */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.taskName.trim()}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <><Loader2 size={16} className="animate-spin" />Saving...</>
                            ) : (
                                <><Save size={16} />Create Task</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectTaskUpsertModal;
