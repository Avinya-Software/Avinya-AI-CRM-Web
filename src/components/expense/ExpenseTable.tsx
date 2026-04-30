// src/components/expense/ExpenseTable.tsx
import { useState, useRef } from "react";
import dayjs from "dayjs";
import { MoreVertical, X } from "lucide-react";

import { useOutsideClick } from "../../hooks/useOutsideClick";

import TableSkeleton from "../common/TableSkeleton";
import { usePermissions } from "../../context/PermissionContext";
import { Expense } from "../../interfaces/expense.interface";
import { useDeleteExpense } from "../../hooks/expense/useDeleteExpense";

const DROPDOWN_WIDTH = 180;

const statusStyles: Record<string, string> = {
    Unpaid: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Paid: "bg-green-100 text-green-700 border-green-200",
    Partial: "bg-purple-100 text-purple-700 border-purple-200",
};

interface Props {
    data: Expense[];
    loading?: boolean;
    onEdit: (expense: Expense) => void;
}

const ExpenseTable = ({ data = [], loading = false, onEdit }: Props) => {
    const { hasPermission } = usePermissions();
    const canUpdate = hasPermission("expense", "edit");
    const canDelete = hasPermission("expense", "delete");

    const [openExpense, setOpenExpense] = useState<Expense | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<Expense | null>(null);
    const [style, setStyle] = useState({ top: 0, left: 0 });

    const dropdownRef = useRef<HTMLDivElement>(null);
    useOutsideClick(dropdownRef, () => setOpenExpense(null));

    const { mutate: deleteExpense, isPending } = useDeleteExpense();

    const openDropdown = (
        e: React.MouseEvent<HTMLButtonElement>,
        expense: Expense
    ) => {
        e.stopPropagation();
        if (!canUpdate && !canDelete) return;

        const rect = e.currentTarget.getBoundingClientRect();
        setStyle({
            top: rect.bottom + window.scrollY + 6,
            left: rect.right + window.scrollX - DROPDOWN_WIDTH,
        });
        setOpenExpense(expense);
    };

    const handleEdit = () => {
        if (!openExpense || !canUpdate) return;
        const exp = openExpense;
        setOpenExpense(null);
        setTimeout(() => onEdit(exp), 0);
    };

    const handleDelete = () => {
        if (!confirmDelete || !canDelete) return;
        console.log("Attempting to delete expense:", confirmDelete);
        deleteExpense(confirmDelete.expenseId, {
            onSuccess: () => {
                setConfirmDelete(null);
                setOpenExpense(null);
            },
        });
    };

    return (
        <div className="relative overflow-x-auto">
            <table className="w-full text-sm border-collapse">
                <thead className="bg-slate-100 sticky top-0 z-10">
                    <tr>
                        <Th>Date</Th>
                        <Th>Type</Th>
                        <Th>Amount (₹)</Th>
                        <Th>Description</Th>
                        <Th>Receipt</Th>
                        <Th>Status</Th>
                        <Th>Remarks</Th>
                        <Th>Created Date</Th>
                        <Th className="text-center">Actions</Th>
                    </tr>
                </thead>

                {loading ? (
                    <TableSkeleton rows={6} columns={9} />
                ) : (
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="text-center py-12 text-slate-500">
                                    No expenses found
                                </td>
                            </tr>
                        ) : (
                            data.map((exp) => {
                                const statusKey = exp.status || "Unpaid";

                                return (
                                    <tr
                                        key={exp.expenseId}
                                        className="border-t h-[52px] hover:bg-slate-50"
                                    >
                                        <Td>
                                            {exp.expenseDate
                                                ? dayjs(exp.expenseDate).format("DD/MM/YYYY")
                                                : "-"}
                                        </Td>

                                        <Td>
                                            <span className="font-medium text-slate-800">
                                                {exp.expenseCategory?.categoryName || "-"}
                                            </span>
                                        </Td>

                                        <Td>
                                            <span className="font-semibold text-slate-800">
                                                {exp.amount != null ? `₹${exp.amount.toLocaleString("en-IN")}` : "-"}
                                            </span>
                                        </Td>

                                        <Td>
                                            <p className="truncate max-w-[200px] text-slate-600">
                                                {exp.description || "-"}
                                            </p>
                                        </Td>

                                        <Td>
                                            {exp.receiptPath ? (
                                                <a
                                                    href={exp.receiptPath.startsWith('http') ? exp.receiptPath : `${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")}${exp.receiptPath}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline text-xs"
                                                >
                                                    View Receipt
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 text-xs">No receipt</span>
                                            )}
                                        </Td>

                                        <Td>
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusStyles[statusKey]}`}
                                            >
                                                {statusKey}
                                            </span>
                                        </Td>

                                        <Td>
                                            <p className="truncate max-w-[150px] text-slate-500 text-xs">
                                                {exp.remarks || "-"}
                                            </p>
                                        </Td>

                                        <Td>
                                            {exp.createdDate
                                                ? dayjs(exp.createdDate).format("DD/MM/YYYY")
                                                : "-"}
                                        </Td>

                                        <Td className="text-center">
                                            {(canUpdate || canDelete) && (
                                                <button
                                                    onClick={(e) => openDropdown(e, exp)}
                                                    className="p-2 rounded hover:bg-slate-200"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            )}
                                        </Td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                )}
            </table>

            {/* DROPDOWN */}
            {openExpense && (
                <div
                    ref={dropdownRef}
                    className="fixed z-50 w-[180px] bg-white border rounded-lg shadow-lg"
                    style={style}
                    onClick={(e) => e.stopPropagation()}
                >
                    {canUpdate && (
                        <MenuItem label="Edit Expense" onClick={handleEdit} />
                    )}
                    {canDelete && (
                        <MenuItem
                            label="Delete Expense"
                            danger
                            onClick={() => {
                                setOpenExpense(null);
                                setConfirmDelete(openExpense);
                            }}
                        />
                    )}
                </div>
            )}

            {/* CONFIRM DELETE MODAL */}
            {confirmDelete && canDelete && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Delete Expense</h3>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="p-1 rounded hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-1">
                            Are you sure you want to delete this{" "}
                            <span className="font-semibold text-slate-800">
                                {confirmDelete.expenseCategory?.categoryName}
                            </span>{" "}
                            expense of{" "}
                            <span className="font-semibold text-slate-800">
                                ₹{confirmDelete.amount?.toLocaleString("en-IN")}
                            </span>
                            ?
                        </p>

                        <p className="text-sm text-red-600 font-medium mb-6">
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 border rounded hover:bg-gray-100 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                className="px-4 py-2 btn-danger rounded disabled:opacity-50 text-sm"
                            >
                                {isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseTable;

/* helpers */
const Th = ({ children, className = "" }: any) => (
    <th className={`px-4 py-3 text-left font-semibold ${className}`}>
        {children}
    </th>
);

const Td = ({ children, className = "" }: any) => (
    <td className={`px-4 py-3 ${className}`}>{children}</td>
);

const MenuItem = ({
    label,
    onClick,
    danger = false,
}: {
    label: string;
    onClick: () => void;
    danger?: boolean;
}) => (
    <button
        onClick={(e) => {
            e.stopPropagation();
            onClick();
        }}
        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 ${danger ? "text-red-600 hover:bg-red-50" : ""
            }`}
    >
        {danger && <X size={14} />}
        {label}
    </button>
);