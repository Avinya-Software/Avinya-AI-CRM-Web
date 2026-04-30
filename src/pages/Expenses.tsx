// src/pages/Expenses.tsx
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Select as AntSelect } from "antd";


import Pagination from "../components/leads/Pagination";

import { usePermissions } from "../context/PermissionContext";
import { Expense } from "../interfaces/expense.interface";
import { useExpenses } from "../hooks/expense/useExpenses";
import ExpenseTable from "../components/expense/ExpenseTable";
import ExpenseUpsertSheet from "../components/expense/ExpenseUpsertSheet";

const Expenses = () => {
    const { hasPermission } = usePermissions();

    const canCreate = hasPermission("expense", "add");
    const canUpdate = hasPermission("expense", "edit");

    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<string | undefined>(undefined);
    const [from, setFrom] = useState<string | undefined>(undefined);
    const [to, setTo] = useState<string | undefined>(undefined);

    const [openSheet, setOpenSheet] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

    const expensesMutation = useExpenses();

    useEffect(() => {
        expensesMutation.mutate({ page, pageSize, status, search, from, to });
    }, [page, pageSize, status, search, from, to]);

    const { data, isPending: isLoading } = expensesMutation;

    const expenses: Expense[] = data?.data?.data ?? [];
    const totalRecords: number = data?.data?.totalRecords ?? 0;
    const totalPages: number = data?.data?.totalPages ?? 1;

    const handleAdd = () => {
        if (!canCreate) return;
        setSelectedExpense(null);
        setOpenSheet(true);
    };

    const handleEdit = (expense: Expense) => {
        if (!canUpdate) return;
        setSelectedExpense(expense);
        setOpenSheet(true);
    };

    const handleSuccess = () => {
        expensesMutation.mutate({ page, pageSize, status, search, from, to });
        setOpenSheet(false);
        setSelectedExpense(null);
    };

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            <div className="bg-white rounded-lg border">
                {/* HEADER */}
                <div className="px-4 py-5 border-b bg-gray-100">
                    <div className="grid grid-cols-2 gap-y-4 items-start">
                        <div>
                            <h1 className="text-4xl font-serif font-semibold">Expenses</h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {totalRecords} total expenses
                            </p>
                        </div>

                        <div className="text-right">
                            {canCreate && (
                                <button
                                    className="inline-flex items-center gap-2 btn-primary px-4 py-2 rounded text-sm font-medium transition"
                                    onClick={handleAdd}
                                >
                                    + Add Expense
                                </button>
                            )}
                        </div>

                        {/* SEARCH + STATUS FILTER */}
                        <div className="flex gap-4">
                            <div className="relative w-[300px]">
                                <input
                                    type="text"
                                    placeholder="Search by description or type..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    🔍
                                </span>
                            </div>

                            <AntSelect
                                className="h-10 w-40"
                                value={status ?? undefined}
                                onChange={(val) => {
                                    setStatus(val);
                                    setPage(1);
                                }}
                                placeholder="All Status"
                                allowClear
                            >
                                <AntSelect.Option value="Unpaid">Unpaid</AntSelect.Option>
                                <AntSelect.Option value="Paid">Paid</AntSelect.Option>
                                <AntSelect.Option value="Partial">Partial</AntSelect.Option>
                            </AntSelect>
                        </div>
                        <div />
                    </div>
                </div>

                {/* TABLE */}
                <ExpenseTable
                    data={expenses}
                    loading={isLoading}
                    onEdit={canUpdate ? handleEdit : () => { }}
                />

                {/* PAGINATION */}
                <div className="border-t px-4 py-3">
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onChange={(page) => setPage(page)}
                    />
                </div>
            </div>

            {/* ADD / EDIT SHEET */}
            <ExpenseUpsertSheet
                open={openSheet}
                expense={selectedExpense}
                onClose={() => setOpenSheet(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
};

export default Expenses;