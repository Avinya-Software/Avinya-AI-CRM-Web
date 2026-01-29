// src/components/users/UserFilterSheet.tsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { UserFilters } from "../../interfaces/user.interface";

interface UserFilterSheetProps {
    open: boolean;
    onClose: () => void;
    filters: UserFilters;
    onApply: (filters: UserFilters) => void;
    onClear: () => void;
}

const UserFilterSheet = ({
    open,
    onClose,
    filters,
    onApply,
    onClear,
}: UserFilterSheetProps) => {
    const [localFilters, setLocalFilters] = useState<UserFilters>(filters);

    useEffect(() => {
        if (open) {
            setLocalFilters(filters);
        }
    }, [open, filters]);

    if (!open) return null;

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        onClear();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold">Filter Users</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={localFilters.fullName || ""}
                            onChange={(e) =>
                                setLocalFilters({
                                    ...localFilters,
                                    fullName: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border rounded text-sm"
                            placeholder="Search by name..."
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            type="text"
                            value={localFilters.email || ""}
                            onChange={(e) =>
                                setLocalFilters({
                                    ...localFilters,
                                    email: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border rounded text-sm"
                            placeholder="Search by email..."
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Role
                        </label>
                        <select
                            value={localFilters.role || ""}
                            onChange={(e) =>
                                setLocalFilters({
                                    ...localFilters,
                                    role: e.target.value,
                                })
                            }
                            className="w-full px-3 py-2 border rounded text-sm"
                        >
                            <option value="">All Roles</option>
                            <option value="SuperAdmin">SuperAdmin</option>
                            <option value="Admin">Admin</option>
                            <option value="Manager">Manager</option>
                            <option value="User">User</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Status
                        </label>
                        <select
                            value={
                                localFilters.isActive === null
                                    ? ""
                                    : localFilters.isActive
                                        ? "true"
                                        : "false"
                            }
                            onChange={(e) =>
                                setLocalFilters({
                                    ...localFilters,
                                    isActive:
                                        e.target.value === ""
                                            ? null
                                            : e.target.value === "true",
                                })
                            }
                            className="w-full px-3 py-2 border rounded text-sm"
                        >
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex gap-3">
                    <button
                        onClick={handleClear}
                        className="flex-1 px-4 py-2 border rounded text-sm font-medium hover:bg-gray-50"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2 bg-blue-900 text-white rounded text-sm font-medium hover:bg-blue-800"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default UserFilterSheet;