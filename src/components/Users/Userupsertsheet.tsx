// src/components/users/UserUpsertSheet.tsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateUserApi, upsertUserApi } from "../../api/user.api";
import type { User, UserUpsertRequest } from "../../interfaces/user.interface";
import { useCompanies } from "../../hooks/users/Useusers";
import { usePermissions } from "../../hooks/users/usePermissions";

interface UserUpsertSheetProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
}

const UserUpsertSheet = ({ open, onClose, user }: UserUpsertSheetProps) => {
    const queryClient = useQueryClient();
    const isEdit = !!user;
    const { data: permissionModules = [] } = usePermissions();

    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const [formData, setFormData] = useState<UserUpsertRequest>({
        fullName: "",
        email: "",
        role: "User",
        tenantId: "",
        isActive: true,
        password: "Default@123",
        permissionIds: selectedPermissions,
    });

    const { data: companies = [], isLoading } = useCompanies();
    useEffect(() => {
        if (open && user) {
            setSelectedPermissions(user.permissionIds ?? []);
            setFormData({
                userId: user.userId,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                isActive: user.isActive,
                password: user.password,
                permissionIds: user.permissionIds ?? [],
            });
        } else if (open && !user) {
            setSelectedPermissions([]);
            setFormData({
                fullName: "",
                email: "",
                role: "User",
                tenantId: "",
                isActive: true,
                password: "Default@123",
                permissionIds: [],
            });
        }
    }, [open, user]);

    const mutation = useMutation({
        mutationFn: upsertUserApi,
        onSuccess: () => {
            toast.success(isEdit ? "User updated successfully" : "User created successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.statusMessage || "Failed to save user");
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateUserApi,
        onSuccess: () => {
            toast.success(isEdit ? "User updated successfully" : "User created successfully");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            onClose();
        },
        onError: (error: any) => {
            console.log(error);
            toast.error(error?.response?.data?.statusMessage || "Failed to save user");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName.trim()) { toast.error("Full name is required"); return; }
        if (!formData.email.trim()) { toast.error("Email is required"); return; }
        if (!formData.tenantId) { toast.error("Tenant is required"); return; }

        const payload = {
            ...formData,
            permissionIds: selectedPermissions,
        };

        if (isEdit) {
            updateMutation.mutate(payload);
        } else {
            mutation.mutate(payload);
        }

    };

    if (!open) return null;

    const togglePermission = (id: number) => {
        setSelectedPermissions((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const handleClose = () => {
        setSelectedPermissions([]);
        setFormData({
            fullName: "",
            email: "",
            role: "User",
            tenantId: "",
            isActive: true,
            password: "Default@123",
            permissionIds: [],
        });
        onClose();
    };


    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

            {/* Sheet */}
            <div className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? "Edit User" : "Add New User"}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-3 py-2 border rounded text-sm"
                                placeholder="Enter full name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border rounded text-sm"
                                placeholder="Enter email address"
                            />
                        </div>

                        {!isEdit && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Company <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.tenantId}
                                        onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                        className="w-full px-3 py-2 border rounded text-sm"
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map((company) => (
                                            <option key={company.tenantId} value={company.tenantId}>
                                                {company.companyName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Role <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border rounded text-sm"
                                    >
                                        <option value="User">User</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Admin">Admin</option>
                                        <option value="SuperAdmin">SuperAdmin</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Status
                            </label>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={formData.isActive}
                                        onChange={() => setFormData({ ...formData, isActive: true })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!formData.isActive}
                                        onChange={() => setFormData({ ...formData, isActive: false })}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Inactive</span>
                                </label>
                            </div>
                        </div>

                        {/* ─── Permissions ─── */}
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3 pb-2 border-b">
                                Permissions
                            </h3>

                            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                                {permissionModules.map((module) => {
                                    const modulePermissionIds = module.permissions.map((p) => p.permissionId);
                                    const allSelected = modulePermissionIds.every((id) =>
                                        selectedPermissions.includes(id)
                                    );

                                    const toggleAll = () => {
                                        if (allSelected) {
                                            setSelectedPermissions((prev) =>
                                                prev.filter((id) => !modulePermissionIds.includes(id))
                                            );
                                        } else {
                                            setSelectedPermissions((prev) => [
                                                ...new Set([...prev, ...modulePermissionIds]),
                                            ]);
                                        }
                                    };

                                    return (
                                        <div
                                            key={module.moduleKey}
                                            className="border rounded-lg p-3 bg-slate-50"
                                        >
                                            {/* Module header */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {module.moduleName}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={toggleAll}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    {allSelected ? "Deselect All" : "Select All"}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                                                {module.permissions.map((perm) => {
                                                    const checked = selectedPermissions.includes(perm.permissionId);
                                                    return (
                                                        <label
                                                            key={perm.permissionId}
                                                            className={`flex items-center gap-2 px-2 py-[6px] rounded-md text-sm cursor-pointer select-none transition-colors ${checked
                                                                ? "bg-blue-50 border border-blue-200 text-blue-700"
                                                                : "border border-transparent text-slate-600 hover:bg-slate-100"
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => togglePermission(perm.permissionId)}
                                                                className="w-[14px] h-[14px] flex-shrink-0 accent-blue-600 cursor-pointer"
                                                            />
                                                            <span className="min-w-0 truncate leading-none">
                                                                {perm.actionName}
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 px-4 py-2 bg-blue-900 text-white rounded text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
                        >
                            {mutation.isPending ? "Saving..." : isEdit ? "Update User" : "Create User"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default UserUpsertSheet;