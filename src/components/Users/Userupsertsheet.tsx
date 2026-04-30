// src/components/users/UserUpsertSheet.tsx
import { useState, useEffect } from "react";
import { Select as AntSelect } from "antd";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateUserApi, upsertUserApi } from "../../api/user.api";
import type { User, UserUpsertRequest } from "../../interfaces/user.interface";
import { useCompanies, useRoles } from "../../hooks/users/Useusers";
import { usePermissions as useUserPermissions } from "../../hooks/users/usePermissions";
import { usePermissions } from "../../context/PermissionContext";
import { useAuth } from "../../auth/useAuth";
import { decodeUserToken } from "../../lib/auth.utils";

interface UserUpsertSheetProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    user: User | null;
}

const UserUpsertSheet = ({ open, onClose, onSuccess, user }: UserUpsertSheetProps) => {
    const queryClient = useQueryClient();
    const isEdit = !!user;

    /* ── PERMISSIONS ── */
    const { hasPermission } = usePermissions();
    const canAdd = hasPermission("user", "add");
    const canEdit = hasPermission("user", "edit");
    const isReadOnly = isEdit ? !canEdit : !canAdd;

    const { token } = useAuth();
    const currentUser = decodeUserToken(token);
    const isSuperAdmin = currentUser?.role === "ROLE_SUPERADMIN" || currentUser?.role === "SuperAdmin";
    const isAdmin = currentUser?.role === "ROLE_ADMIN" || currentUser?.role === "Admin";

    const permissionModulesMutation = useUserPermissions();
    const permissionModules = permissionModulesMutation.data ?? [];

    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

    const [formData, setFormData] = useState<UserUpsertRequest>({
        fullName: "",
        email: "",
        role: "",
        tenantId: isSuperAdmin ? "" : (currentUser?.tenantId || ""),
        isActive: true,
        password: "Default@123",
        permissionIds: selectedPermissions,
    });

    const companiesMutation = useCompanies();
    const companies = companiesMutation.data ?? [];

    const rolesMutation = useRoles();
    const allRoles = rolesMutation.data ?? [];

    const availableRoles = allRoles.filter(role => {
        if (isAdmin && !isSuperAdmin) {
            return role.id !== "ROLE_SUPERADMIN" && role.name !== "SuperAdmin";
        }
        return true;
    });

    useEffect(() => {
        if (open) {
            permissionModulesMutation.mutate();
            companiesMutation.mutate();
            rolesMutation.mutate();
        }
    }, [open]);

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
                role: "",
                tenantId: isSuperAdmin ? "" : (currentUser?.tenantId || ""),
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
            onSuccess?.();
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
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.statusMessage || "Failed to save user");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName.trim()) { toast.error("Full name is required"); return; }
        if (!formData.email.trim()) { toast.error("Email is required"); return; }
        if (!formData.tenantId) { toast.error("Tenant is required"); return; }
        if (!formData.role) { toast.error("Role is required"); return; }

        const payload = { ...formData, permissionIds: selectedPermissions };

        if (isEdit) {
            updateMutation.mutate(payload);
        } else {
            mutation.mutate(payload);
        }
    };

    const togglePermission = (id: number) => {
        if (isReadOnly) return;
        setSelectedPermissions((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        );
    };

    const handleClose = () => {
        setSelectedPermissions([]);
        setFormData({
            fullName: "",
            email: "",
            role: "",
            tenantId: isSuperAdmin ? "" : (currentUser?.tenantId || ""),
            isActive: true,
            password: "Default@123",
            permissionIds: [],
        });
        onClose();
    };

    // Hard guard — don't render if no permission
    if (!open) return null;
    if (isEdit && !canEdit) return null;
    if (!isEdit && !canAdd) return null;

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
                                disabled={isReadOnly}
                                className="w-full px-3 py-2 border rounded text-sm disabled:bg-slate-50 disabled:text-slate-500"
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
                                disabled={isReadOnly}
                                className="w-full px-3 py-2 border rounded text-sm disabled:bg-slate-50 disabled:text-slate-500"
                                placeholder="Enter email address"
                            />
                        </div>

                        {isSuperAdmin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Company <span className="text-red-500">*</span>
                                </label>
                                <AntSelect
                                    showSearch
                                    className="w-full h-10"
                                    value={formData.tenantId || undefined}
                                    onChange={(val) => setFormData({ ...formData, tenantId: val })}
                                    disabled={isReadOnly}
                                    placeholder="Select Company"
                                    optionFilterProp="children"
                                >
                                    {companies.map((company) => (
                                        <AntSelect.Option key={company.tenantId} value={company.tenantId}>
                                            {company.companyName}
                                        </AntSelect.Option>
                                    ))}
                                </AntSelect>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <AntSelect
                                showSearch
                                className="w-full h-10"
                                value={formData.role || undefined}
                                onChange={(val) => setFormData({ ...formData, role: val })}
                                disabled={isReadOnly}
                                placeholder="Select Role"
                                optionFilterProp="children"
                            >
                                {availableRoles.map((role) => (
                                    <AntSelect.Option key={role.id} value={role.name}>
                                        {role.name}
                                    </AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>


                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Status
                            </label>
                            <div className="flex items-center gap-4">
                                <label className={`flex items-center gap-2 ${isReadOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                    <input
                                        type="radio"
                                        checked={formData.isActive}
                                        onChange={() => !isReadOnly && setFormData({ ...formData, isActive: true })}
                                        disabled={isReadOnly}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm">Active</span>
                                </label>
                                <label className={`flex items-center gap-2 ${isReadOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                                    <input
                                        type="radio"
                                        checked={!formData.isActive}
                                        onChange={() => !isReadOnly && setFormData({ ...formData, isActive: false })}
                                        disabled={isReadOnly}
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
                                {permissionModules
                                    .filter(module => module.moduleKey !== "followup")
                                    .map((module) => {
                                    const modulePermissionIds = module.permissions.map((p) => p.permissionId);
                                    const allSelected = modulePermissionIds.every((id) =>
                                        selectedPermissions.includes(id)
                                    );

                                    const toggleAll = () => {
                                        if (isReadOnly) return;
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
                                                {/* Select All / Deselect All hidden in read-only mode */}
                                                {!isReadOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={toggleAll}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        {allSelected ? "Deselect All" : "Select All"}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-x-2 gap-y-1">
                                                {module.permissions.map((perm) => {
                                                    const checked = selectedPermissions.includes(perm.permissionId);
                                                    return (
                                                        <label
                                                            key={perm.permissionId}
                                                            className={`flex items-center gap-2 px-2 py-[6px] rounded-md text-sm select-none transition-colors ${isReadOnly
                                                                    ? "cursor-not-allowed opacity-70"
                                                                    : "cursor-pointer"
                                                                } ${checked
                                                                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                                                                    : "border border-transparent text-slate-600 hover:bg-slate-100"
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                onChange={() => togglePermission(perm.permissionId)}
                                                                disabled={isReadOnly}
                                                                className="w-[14px] h-[14px] flex-shrink-0 accent-blue-600 cursor-pointer disabled:cursor-not-allowed"
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

                        {/* Save button hidden in read-only mode */}
                        {!isReadOnly && (
                            <button
                                type="submit"
                                disabled={mutation.isPending || updateMutation.isPending}
                                className="flex-1 px-4 py-2 btn-primary rounded text-sm font-medium disabled:opacity-50"
                            >
                                {(mutation.isPending || updateMutation.isPending)
                                    ? "Saving..."
                                    : isEdit ? "Update User" : "Create User"
                                }
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
};

export default UserUpsertSheet;