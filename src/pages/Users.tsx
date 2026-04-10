import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { useUsers } from "../hooks/users/Useusers";
import UserTable from "../components/Users/Usertable";
import Pagination from "../components/Users/Pagination";
import UserFilterSheet from "../components/Users/Userfiltersheet ";
import UserUpsertSheet from "../components/Users/Userupsertsheet";
import { useApproveUser } from "../hooks/admin/useApproveAdmin";
import { usePermissions } from "../context/PermissionContext"; // ✅ added

const DEFAULT_FILTERS = {
    pageNumber: 1,
    pageSize: 10,
    search: "",
    fullName: "",
    email: "",
    role: "",
    tenantId: null as string | null,
    isActive: null as boolean | null,
};

const Users = () => {

    /* 🔐 PERMISSIONS */
    const { hasPermission } = usePermissions();
    const canView = hasPermission("user", "view");
    const canCreate = hasPermission("user", "add");
    const canUpdate = hasPermission("user", "edit");
    const canApprove = hasPermission("user", "approve");

    /* STATE */
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [openUserSheet, setOpenUserSheet] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [openFilterSheet, setOpenFilterSheet] = useState(false);

    /* API */
    const usersMutation = useUsers();

    useEffect(() => {
        usersMutation.mutate(filters);
    }, [filters]);

    const { data, isPending: isLoading } = usersMutation;
    const approveAdmin = useApproveUser();

    /* HELPERS */
    const hasActiveFilters =
        filters.search ||
        filters.fullName ||
        filters.email ||
        filters.role ||
        filters.tenantId ||
        filters.isActive !== null;

    const clearAllFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    const handleAddUser = () => {
        if (!canCreate) return;
        setSelectedUser(null);
        setOpenUserSheet(true);
    };

    const handleEditUser = (user: any) => {
        if (!canUpdate) return;
        setSelectedUser(user);
        setOpenUserSheet(true);
    };

    const handleApprove = (tenantId: string) => {
        if (!canApprove) return;
        approveAdmin.mutate(tenantId);
    };

    // 🔐 If no view permission → block page
    if (!canView) {
        return (
            <div className="p-10 text-center text-slate-500">
                You don't have permission to view this page.
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            <div className="bg-white rounded-lg border">
                {/* HEADER */}
                <div className="px-4 py-5 border-b bg-gray-100">
                    <div className="grid grid-cols-2 gap-y-4 items-start">
                        <div>
                            <h1 className="text-4xl font-serif font-semibold text-slate-900">
                                Users
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {data?.totalRecords ?? 0} total users
                            </p>
                        </div>

                        {/* ADD USER BUTTON */}
                        <div className="text-right">
                            {canCreate && (
                                <button
                                    className="inline-flex items-center gap-2 btn-primary px-4 py-2 rounded text-sm font-medium"
                                    onClick={handleAddUser}
                                >
                                    <span className="text-lg leading-none">+</span>
                                    Add User
                                </button>
                            )}
                        </div>

                        {/* SEARCH */}
                        <div>
                            <div className="relative w-[360px]">
                                <input
                                    type="text"
                                    placeholder="Search users by name, email, or role..."
                                    value={filters.search}
                                    onChange={(e) =>
                                        setFilters({
                                            ...filters,
                                            search: e.target.value,
                                            pageNumber: 1,
                                        })
                                    }
                                    className="w-full h-10 pl-10 pr-3 border rounded text-sm"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔍
                                </span>
                            </div>
                        </div>

                        {/* FILTER + CLEAR */}
                        <div className="flex justify-end gap-2">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50"
                                >
                                    <X size={14} />
                                    Clear Filters
                                </button>
                            )}

                            <button
                                onClick={() => setOpenFilterSheet(true)}
                                className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                <Filter size={16} />
                                Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* USERS TABLE */}
                <UserTable
                    data={data?.data ?? []}
                    loading={isLoading}
                    onAdd={canCreate ? handleAddUser : undefined}
                    onEdit={canUpdate ? handleEditUser : undefined}
                    onApprove={canApprove ? handleApprove : undefined}
                />

                {/* PAGINATION */}
                <div className="border-t px-4 py-3">
                    <Pagination
                        page={filters.pageNumber}
                        totalPages={data?.totalPages || 1}
                        onChange={(page) =>
                            setFilters({ ...filters, pageNumber: page })
                        }
                    />
                </div>
            </div>

            {/* FILTER SHEET */}
            <UserFilterSheet
                open={openFilterSheet}
                onClose={() => setOpenFilterSheet(false)}
                filters={filters}
                onApply={(f) => setFilters({ ...filters, ...f, pageNumber: 1 })}
                onClear={clearAllFilters}
            />

            {/* UPSERT SHEET */}
            {canCreate || canUpdate ? (
                <UserUpsertSheet
                    open={openUserSheet}
                    onClose={() => {
                        setOpenUserSheet(false);
                        setSelectedUser(null);
                    }}
                    user={selectedUser}
                />
            ) : null}
        </>
    );
};

export default Users;