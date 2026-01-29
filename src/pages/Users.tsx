import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Toaster } from "react-hot-toast";

import { useUsers } from "../hooks/users/Useusers";
import UserTable from "../components/Users/Usertable";
import Pagination from "../components/Users/Pagination";
import UserFilterSheet from "../components/Users/Userfiltersheet ";
import UserUpsertSheet from "../components/Users/Userupsertsheet";

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
    /*   STATE   */

    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    const [openUserSheet, setOpenUserSheet] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    const [openFilterSheet, setOpenFilterSheet] = useState(false);

    /*   API   */

    const { data, isLoading, isFetching } = useUsers(filters);

    /*   HELPERS   */

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
        setSelectedUser(null);
        setOpenUserSheet(true);
    };

    const handleEditUser = (user: any) => {
        setSelectedUser(user);
        setOpenUserSheet(true);
    };

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            <div className="bg-white rounded-lg border">
                {/*  HEADER  */}
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

                        <div className="text-right">
                            <button
                                className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium"
                                onClick={handleAddUser}
                            >
                                <span className="text-lg leading-none">+</span>
                                Add User
                            </button>
                        </div>

                        {/* 🔍 SEARCH */}
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

                        {/* 🎯 FILTER + CLEAR */}
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

                {/*   USERS TABLE   */}
                <UserTable
                    data={data?.data ?? []}
                    loading={isLoading || isFetching}
                    onAdd={handleAddUser}
                    onEdit={handleEditUser}
                />

                {/*   PAGINATION   */}
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

            {/*   FILTER SHEET   */}
            <UserFilterSheet
                open={openFilterSheet}
                onClose={() => setOpenFilterSheet(false)}
                filters={filters}
                onApply={(f) => setFilters({ ...filters, ...f, pageNumber: 1 })}
                onClear={clearAllFilters}
            />

            {/*   UPSERT SHEET   */}
            <UserUpsertSheet
                open={openUserSheet}
                onClose={() => {
                    setOpenUserSheet(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
            />
        </>
    );
};

export default Users;