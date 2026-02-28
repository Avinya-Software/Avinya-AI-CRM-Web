// src/components/project/ProjectUpsertSheet.tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { createProjectApi, updateProjectApi } from "../../api/project.api";

import Spinner from "../common/Spinner";
import SearchableComboBox from "../common/SearchableComboBox";
import type { Project, CreateProjectDto } from "../../interfaces/project.interface";
import { getCustomerDropdownApi } from "../../api/customer.api";
import { Combobox, ComboboxOption } from "../ui/combobox";
import { useUsersDropdown } from "../../hooks/users/Useusers";
import { useGetTeamsDropdown } from "../../hooks/team/useTeamMutation";

interface Props {
    open: boolean;
    onClose: () => void;
    project?: Project | null;
    onSuccess: () => void;
}

const STATUS_OPTIONS = [
    { value: 0, label: "Planning" },
    { value: 1, label: "Active" },
    { value: 2, label: "Completed" },
    { value: 3, label: "On Hold" },
];

const PRIORITY_OPTIONS = [
    { value: 0, label: "Low" },
    { value: 1, label: "Medium" },
    { value: 2, label: "High" },
    { value: 3, label: "Critical" },
];

const ProjectUpsertSheet = ({ open, onClose, project, onSuccess }: Props) => {
    /* LOCK BODY SCROLL */
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [open]);

    /* ── DROPDOWN DATA ── */

    // Customers → Client Name field
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    useEffect(() => {
        getCustomerDropdownApi().then(setCustomers);
    }, []);

    // Employees → Project Manager field
    const { data: usersResponse } = useUsersDropdown();
    const userOptions: ComboboxOption[] = (usersResponse ?? []).map(
        (u: any) => ({ value: String(u.id), label: u.fullName })
    );

    // Teams → Team field
    const { data: teamResponse } = useGetTeamsDropdown();
    const teamOptions: ComboboxOption[] = (teamResponse?.data ?? []).map(
        (t: any) => ({ value: String(t.id), label: t.name })
    );

    /* FORM STATE */
    const initialForm: CreateProjectDto = {
        projectID: null,
        projectName: "",
        description: "",
        clientID: null,
        location: "",
        status: 0,
        priority: 1,
        progressPercent: 0,
        projectManagerId: null,
        assignedToUserId: null,
        teamId: null,
        startDate: null,
        endDate: null,
        deadline: null,
        estimatedValue: null,
        notes: "",
    };

    const [form, setForm] = useState<CreateProjectDto>(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    /* PREFILL ON OPEN */
    useEffect(() => {
        if (!open) return;

        if (project) {
            setSelectedCustomerId(project.clientID ?? "");
            setForm({
                projectID: project.projectID,
                projectName: project.projectName ?? "",
                description: project.description ?? "",
                clientID: project.clientID ?? null,
                location: project.location ?? "",
                status: project.status ?? 0,
                priority: project.priority ?? 1,
                progressPercent: project.progressPercent ?? 0,
                projectManagerId: project.projectManagerId ? String(project.projectManagerId) : null,
                assignedToUserId: project.assignedToUserId ? String(project.assignedToUserId) : null,
                teamId: project.teamId ? Number(project.teamId) : null,
                startDate: project.startDate ? project.startDate.substring(0, 10) : null,
                endDate: project.endDate ? project.endDate.substring(0, 10) : null,
                deadline: project.deadline ? project.deadline.substring(0, 10) : null,
                estimatedValue: project.estimatedValue ?? null,
                notes: project.notes ?? "",
            });
        } else {
            setSelectedCustomerId("");
            setForm(initialForm);
        }

        setErrors({});
    }, [open, project]);

    /* VALIDATION */
    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.projectName?.trim()) e.projectName = "Project name is required";
        if ((form.progressPercent ?? 0) < 0 || (form.progressPercent ?? 0) > 100)
            e.progressPercent = "Must be between 0 and 100";
        setErrors(e);
        if (Object.keys(e).length) {
            toast.error("Please fix validation errors");
            return false;
        }
        return true;
    };

    /* SAVE */
    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        try {
            const payload: CreateProjectDto = {
                ...form,
                teamId: form.teamId ? Number(form.teamId) : null,
                startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
                endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
                deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
            };

            if (project?.projectID) {
                await updateProjectApi(payload);
                toast.success("Project updated successfully");
            } else {
                await createProjectApi(payload);
                toast.success("Project created successfully");
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <>
            {/* OVERLAY */}
            <div
                className="fixed inset-0 bg-black/40 z-[60]"
                onClick={saving ? undefined : onClose}
            />

            {/* SHEET */}
            <div className="fixed top-0 right-0 h-screen w-[460px] bg-white z-[70] shadow-2xl flex flex-col animate-slideInRight">

                {/* HEADER */}
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-lg">
                        {project ? "Edit Project" : "New Project"}
                    </h2>
                    <button onClick={onClose} disabled={saving} className="p-1 rounded hover:bg-slate-100">
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                    {/* Project Name */}
                    <Input
                        label="Project Name"
                        required
                        value={form.projectName}
                        error={errors.projectName}
                        onChange={(v: string) => setForm({ ...form, projectName: v })}
                        placeholder="e.g. Waterproofing for High-Rise Building"
                    />

                    {/* Description */}
                    <Textarea
                        label="Description"
                        value={form.description ?? ""}
                        onChange={(v: string) => setForm({ ...form, description: v })}
                        placeholder="Project details..."
                    />

                    {/* Client Name + Location */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Client Name — customer dropdown, shows companyName */}
                        <div>
                            <SearchableComboBox
                                label="Client Name"
                                items={customers.map((c) => ({
                                    value: c.clientID,
                                    label: c.companyName || c.contactPerson || c.clientID,
                                }))}
                                value={selectedCustomerId}
                                onSelect={(item) => {
                                    setSelectedCustomerId(item?.value ?? "");
                                    setForm({ ...form, clientID: item?.value ?? null });
                                }}
                            />
                        </div>
                        <Input
                            label="Location"
                            value={form.location ?? ""}
                            onChange={(v: string) => setForm({ ...form, location: v })}
                            placeholder="Project location"
                        />
                    </div>

                    {/* Status + Priority + Progress */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <select
                                className="input w-full mt-1"
                                value={form.status ?? 0}
                                onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                            >
                                {STATUS_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Priority</label>
                            <select
                                className="input w-full mt-1"
                                value={form.priority ?? 1}
                                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                            >
                                {PRIORITY_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Progress %"
                            type="number"
                            value={form.progressPercent ?? 0}
                            error={errors.progressPercent}
                            onChange={(v: string) =>
                                setForm({ ...form, progressPercent: Math.min(100, Math.max(0, Number(v))) })
                            }
                            placeholder="0"
                        />
                    </div>

                    {/* Project Manager — employee/user dropdown */}
                    <div>
                        <label className="text-sm font-medium">Project Manager</label>
                        <div className="mt-1">
                            <Combobox
                                options={userOptions}
                                value={form.projectManagerId ? String(form.projectManagerId) : ""}
                                onValueChange={(val) =>
                                    setForm({ ...form, projectManagerId: val || null })
                                }
                                placeholder="Select manager..."
                                searchPlaceholder="Search employees..."
                                emptyText="No employees found."
                            />
                        </div>
                    </div>

                    {/* Team dropdown */}
                    <div>
                        <label className="text-sm font-medium">Team</label>
                        <div className="mt-1">
                            <Combobox
                                options={teamOptions}
                                value={form.teamId ? String(form.teamId) : ""}
                                onValueChange={(val) =>
                                    setForm({ ...form, teamId: val ? Number(val) : null })
                                }
                                placeholder="Select team..."
                                searchPlaceholder="Search teams..."
                                emptyText="No teams found."
                            />
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <input
                                type="date"
                                className="input w-full mt-1"
                                value={form.startDate ?? ""}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value || null })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">End Date</label>
                            <input
                                type="date"
                                className="input w-full mt-1"
                                value={form.endDate ?? ""}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Deadline</label>
                            <input
                                type="date"
                                className="input w-full mt-1"
                                value={form.deadline ?? ""}
                                onChange={(e) => setForm({ ...form, deadline: e.target.value || null })}
                            />
                        </div>
                    </div>

                    {/* Estimated Value */}
                    <Input
                        label="Estimated Value (₹)"
                        type="number"
                        value={form.estimatedValue ?? ""}
                        onChange={(v: string) =>
                            setForm({ ...form, estimatedValue: v ? Number(v) : null })
                        }
                        placeholder="0"
                    />

                    {/* Notes */}
                    <Textarea
                        label="Notes"
                        value={form.notes ?? ""}
                        onChange={(v: string) => setForm({ ...form, notes: v })}
                        placeholder="Additional notes..."
                    />
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t flex gap-3">
                    <button
                        className="flex-1 border rounded-lg py-2 hover:bg-slate-50"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={saving}
                        className="flex-1 bg-blue-900 text-white rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-blue-800 disabled:opacity-50"
                        onClick={handleSave}
                    >
                        {saving && <Spinner />}
                        {saving ? "Saving..." : project ? "Update" : "Create"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProjectUpsertSheet;

/*   HELPERS   */
const Input = ({ label, required, value, error, type = "text", onChange, placeholder }: any) => (
    <div>
        <label className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            className={`input w-full mt-1 ${error ? "border-red-500" : ""}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

const Textarea = ({ label, value, onChange, placeholder }: any) => (
    <div>
        <label className="text-sm font-medium">{label}</label>
        <textarea
            className="input w-full h-20 mt-1 resize-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);