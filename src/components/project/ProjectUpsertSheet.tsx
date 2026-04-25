import { useEffect, useState } from "react";
import { DatePicker, Select as AntSelect } from "antd";
import dayjs from "dayjs";
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
import { usePermissions } from "../../context/PermissionContext";
import {
    normalizeProjectPriorityOptions,
    normalizeProjectStatusOptions,
} from "../../lib/project-display";
import {
    useProjectPriorityDropdown,
    useProjectStatusDropdown,
} from "../../hooks/project/useProjectDropdowns";

interface Props {
    open: boolean;
    onClose: () => void;
    project?: Project | null;
    onSuccess: () => void;
}

const ProjectUpsertSheet = ({ open, onClose, project, onSuccess }: Props) => {
    const isEdit = !!project;

    /* ── PERMISSIONS ── */
    const { hasPermission } = usePermissions();
    const canAdd = hasPermission("project", "add");
    const canEdit = hasPermission("project", "edit");

    // Derive a single read-only flag used throughout the form
    const isReadOnly = isEdit ? !canEdit : !canAdd;

    /* LOCK BODY SCROLL */
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [open]);

    /* ── DROPDOWN DATA ── */
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    useEffect(() => {
        getCustomerDropdownApi().then(setCustomers);
    }, []);

    const usersDropdownMutation = useUsersDropdown();
    const teamsDropdownMutation = useGetTeamsDropdown();
    const { data: projectStatusData = [] } = useProjectStatusDropdown();
    const { data: projectPriorityData = [] } = useProjectPriorityDropdown();

    useEffect(() => {
        usersDropdownMutation.mutate(undefined);
        teamsDropdownMutation.mutate(undefined);
    }, []);

    const usersResponse = usersDropdownMutation.data;
    const userOptions: ComboboxOption[] = (usersResponse ?? []).map(
        (u: any) => ({ value: String(u.id), label: u.fullName })
    );

    const teamResponse = teamsDropdownMutation.data;
    const teamOptions: ComboboxOption[] = (teamResponse?.data ?? []).map(
        (t: any) => ({ value: String(t.id), label: t.name })
    );
    const statusOptions = normalizeProjectStatusOptions(projectStatusData);
    const priorityOptions = normalizeProjectPriorityOptions(projectPriorityData);
    const defaultStatus = statusOptions[0]?.value ?? 1;
    const defaultPriority = priorityOptions[0]?.value ?? 1;

    /* FORM STATE */
    const getInitialForm = (): CreateProjectDto => ({
        projectID: null,
        projectName: "",
        description: "",
        clientID: null,
        location: "",
        status: defaultStatus,
        priority: defaultPriority,
        progressPercent: 0,
        projectManagerId: null,
        assignedToUserId: null,
        teamId: null,
        startDate: null,
        endDate: null,
        deadline: null,
        estimatedValue: null,
        notes: "",
    });

    const [form, setForm] = useState<CreateProjectDto>(getInitialForm);
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
                status: project.status ?? defaultStatus,
                priority: project.priority ?? defaultPriority,
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
            setForm(getInitialForm());
        }

        setErrors({});
    }, [open, project, defaultStatus, defaultPriority]);

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

    // Hard guard — don't render if no permission
    if (!open) return null;
    if (isEdit && !canEdit) return null;
    if (!isEdit && !canAdd) return null;

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
                        disabled={isReadOnly}
                    />

                    {/* Description */}
                    <Textarea
                        label="Description"
                        value={form.description ?? ""}
                        onChange={(v: string) => setForm({ ...form, description: v })}
                        placeholder="Project details..."
                        disabled={isReadOnly}
                    />

                    {/* Client Name + Location */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <SearchableComboBox
                                label="Customer Name"
                                items={customers.map((c) => ({
                                    value: c.clientID,
                                    label: c.companyName || c.contactPerson || c.clientID,
                                }))}
                                value={selectedCustomerId}
                                onSelect={isReadOnly ? undefined : (item: any) => {
                                    setSelectedCustomerId(item?.value ?? "");
                                    setForm({ ...form, clientID: item?.value ?? null });
                                }}
                                disabled={isReadOnly}
                            />
                        </div>
                        <Input
                            label="Location"
                            value={form.location ?? ""}
                            onChange={(v: string) => setForm({ ...form, location: v })}
                            placeholder="Project location"
                            disabled={isReadOnly}
                        />
                    </div>

                    {/* Status + Priority + Progress */}
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <AntSelect
                                className="w-full h-10 mt-1"
                                value={form.status ?? defaultStatus}
                                onChange={(val) => setForm({ ...form, status: val })}
                                disabled={isReadOnly}
                            >
                                {statusOptions.map(o => (
                                    <AntSelect.Option key={o.value} value={o.value}>{o.label}</AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Priority</label>
                            <AntSelect
                                className="w-full h-10 mt-1"
                                value={form.priority ?? defaultPriority}
                                onChange={(val) => setForm({ ...form, priority: val })}
                                disabled={isReadOnly}
                            >
                                {priorityOptions.map(o => (
                                    <AntSelect.Option key={o.value} value={o.value}>{o.label}</AntSelect.Option>
                                ))}
                            </AntSelect>
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
                            disabled={isReadOnly}
                        />
                    </div>

                    {/* Project Manager */}
                    <div>
                        <label className="text-sm font-medium">Project Manager</label>
                        <div className="mt-1">
                            <Combobox
                                options={userOptions}
                                value={form.projectManagerId ? String(form.projectManagerId) : ""}
                                onValueChange={(val) =>
                                    !isReadOnly && setForm({ ...form, projectManagerId: val || null })
                                }
                                placeholder="Select manager..."
                                searchPlaceholder="Search employees..."
                                emptyText="No employees found."
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>

                    {/* Team */}
                    <div>
                        <label className="text-sm font-medium">Team</label>
                        <div className="mt-1">
                            <Combobox
                                options={teamOptions}
                                value={form.teamId ? String(form.teamId) : ""}
                                onValueChange={(val) =>
                                    !isReadOnly && setForm({ ...form, teamId: val ? Number(val) : null })
                                }
                                placeholder="Select team..."
                                searchPlaceholder="Search teams..."
                                emptyText="No teams found."
                                disabled={isReadOnly}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <DatePicker
                                className="w-full h-10 border-slate-300 rounded-lg mt-1"
                                format="YYYY-MM-DD"
                                placeholder="Select start date"
                                value={form.startDate ? dayjs(form.startDate) : null}
                                onChange={(date, dateString) =>
                                    setForm({ ...form, startDate: Array.isArray(dateString) ? dateString[0] : dateString })
                                }
                                disabled={isReadOnly}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">End Date</label>
                            <DatePicker
                                className="w-full h-10 border-slate-300 rounded-lg mt-1"
                                format="YYYY-MM-DD"
                                placeholder="Select end date"
                                value={form.endDate ? dayjs(form.endDate) : null}
                                onChange={(date, dateString) =>
                                    setForm({ ...form, endDate: Array.isArray(dateString) ? dateString[0] : dateString })
                                }
                                disabled={isReadOnly}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Deadline</label>
                            <DatePicker
                                className="w-full h-10 border-slate-300 rounded-lg mt-1"
                                format="YYYY-MM-DD"
                                placeholder="Select deadline"
                                value={form.deadline ? dayjs(form.deadline) : null}
                                onChange={(date, dateString) =>
                                    setForm({ ...form, deadline: Array.isArray(dateString) ? dateString[0] : dateString })
                                }
                                disabled={isReadOnly}
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
                        disabled={isReadOnly}
                    />

                    {/* Notes */}
                    <Textarea
                        label="Notes"
                        value={form.notes ?? ""}
                        onChange={(v: string) => setForm({ ...form, notes: v })}
                        placeholder="Additional notes..."
                        disabled={isReadOnly}
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

                    {/* Only show Save/Update if user has permission */}
                    {!isReadOnly && (
                        <button
                            disabled={saving}
                            className="flex-1 btn-primary rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                            onClick={handleSave}
                        >
                            {saving && <Spinner />}
                            {saving ? "Saving..." : project ? "Update" : "Create"}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProjectUpsertSheet;

/*   HELPERS   */
const Input = ({ label, required, value, error, type = "text", onChange, placeholder, disabled }: any) => (
    <div>
        <label className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            className={`input w-full mt-1 ${error ? "border-red-500" : ""} disabled:bg-slate-50 disabled:text-slate-500`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
);

const Textarea = ({ label, value, onChange, placeholder, disabled }: any) => (
    <div>
        <label className="text-sm font-medium">{label}</label>
        <textarea
            className="input w-full h-20 mt-1 resize-none disabled:bg-slate-50 disabled:text-slate-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
        />
    </div>
);
