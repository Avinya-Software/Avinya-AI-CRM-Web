// src/components/expense/ExpenseUpsertSheet.tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";


import Spinner from "../common/Spinner";

import { usePermissions } from "../../context/PermissionContext";
import { Expense } from "../../interfaces/expense.interface";
import { useUpsertExpense } from "../../hooks/expense/useUpsertExpense";

// Expense type options (adjust to match your backend enums/dropdown)
const EXPENSE_TYPES = [
    "Travel",
    "Food & Beverage",
    "Accommodation",
    "Office Supplies",
    "Utilities",
    "Marketing",
    "Maintenance",
    "Other",
];

interface Props {
    open: boolean;
    onClose: () => void;
    expense?: Expense | null;
    onSuccess: () => void;
}

const ExpenseUpsertSheet = ({ open, onClose, expense, onSuccess }: Props) => {
    const { mutateAsync, isPending } = useUpsertExpense();

    const { hasPermission } = usePermissions();
    const isEdit = !!expense;
    const canCreate = hasPermission("expense", "add");
    const canUpdate = hasPermission("expense", "edit");
    const hasAccess = isEdit ? canUpdate : canCreate;

    const today = new Date().toISOString().split("T")[0];

    const initialForm = {
        expenseID: null as string | null,
        expenseDate: today,
        expenseType: "",
        amount: "" as number | string,
        description: "",
        receiptUrl: "",
        status: "pending",
        remarks: "",
    };

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Close if no permission
    useEffect(() => {
        if (open && !hasAccess) {
            toast.error("You don't have permission for this action");
            onClose();
        }
    }, [open, hasAccess]);

    useEffect(() => {
        if (!open) return;

        if (expense) {
            setForm({
                expenseID: expense.expenseId ?? null,
                expenseDate: expense.expenseDate
                    ? expense.expenseDate.split("T")[0]
                    : today,
                expenseType: expense.expenseType ?? "",
                amount: expense.amount ?? "",
                description: expense.description ?? "",
                receiptUrl: expense.receiptUrl ?? "",
                status: expense.status ?? "pending",
                remarks: expense.remarks ?? "",
            });
        } else {
            setForm(initialForm);
        }

        setErrors({});
    }, [open, expense]);

    const validate = () => {
        const e: Record<string, string> = {};

        if (!form.expenseDate) e.expenseDate = "Date is required";
        if (!form.expenseType) e.expenseType = "Expense type is required";
        if (form.amount === "" || Number(form.amount) <= 0)
            e.amount = "Amount is required and must be greater than 0";

        setErrors(e);

        if (Object.keys(e).length) {
            toast.error("Please fix validation errors");
            return false;
        }
        return true;
    };

    const handleSave = async () => {
        if (!hasAccess) {
            toast.error("Permission denied");
            return;
        }
        if (!validate()) return;

        const payload = {
            expenseID: form.expenseID,
            expenseDate: form.expenseDate,
            expenseType: form.expenseType,
            amount: Number(form.amount),
            description: form.description.trim() || null,
            receiptUrl: form.receiptUrl.trim() || null,
            status: form.status,
            remarks: form.remarks.trim() || null,
        };

        await mutateAsync(payload);
        toast.success(`Expense ${expense ? "updated" : "added"} successfully`);
        onClose();
        onSuccess();
    };

    if (!open || !hasAccess) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/40 z-[60]"
                onClick={isPending ? undefined : onClose}
            />

            <div className="fixed top-0 right-0 h-screen w-[440px] bg-white z-[70] shadow-2xl flex flex-col">
                {/* HEADER */}
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="font-semibold text-lg">
                        {expense ? "Edit Expense" : "Add Expense"}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="p-1 rounded hover:bg-slate-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                    {/* Date + Type (side by side) */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Expense Date" required error={errors.expenseDate}>
                            <input
                                type="date"
                                className={`input w-full ${errors.expenseDate ? "border-red-500" : ""}`}
                                value={form.expenseDate}
                                onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                            />
                        </Field>

                        <Field label="Expense Type" required error={errors.expenseType}>
                            <select
                                className={`input w-full ${errors.expenseType ? "border-red-500" : ""}`}
                                value={form.expenseType}
                                onChange={(e) => setForm({ ...form, expenseType: e.target.value })}
                            >
                                <option value="">Select Type</option>
                                {EXPENSE_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    {/* Amount */}
                    <Field label="Amount (₹)" required error={errors.amount}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter amount"
                            className={`input w-full ${errors.amount ? "border-red-500" : ""}`}
                            value={form.amount}
                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        />
                    </Field>

                    {/* Description */}
                    <Field label="Description">
                        <textarea
                            rows={3}
                            placeholder="Brief description of the expense..."
                            className="input w-full resize-none"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </Field>

                    {/* Receipt URL */}
                    <Field label="Receipt / Bill URL">
                        <input
                            type="text"
                            placeholder="Paste receipt link (optional)"
                            className="input w-full"
                            value={form.receiptUrl}
                            onChange={(e) => setForm({ ...form, receiptUrl: e.target.value })}
                        />
                        <p className="text-xs text-slate-400 mt-1">
                            Paste a URL to the uploaded receipt (JPG, PNG, or PDF)
                        </p>
                    </Field>

                    {/* Status (only show on edit) */}
                    {isEdit && (
                        <Field label="Status">
                            <select
                                className="input w-full"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="paid">Paid</option>
                            </select>
                        </Field>
                    )}

                    {/* Remarks (only show on edit) */}
                    {isEdit && (
                        <Field label="Remarks">
                            <textarea
                                rows={2}
                                placeholder="Admin remarks..."
                                className="input w-full resize-none"
                                value={form.remarks}
                                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                            />
                        </Field>
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t flex gap-3">
                    <button
                        className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-slate-50"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </button>

                    <button
                        disabled={isPending || !hasAccess}
                        className="flex-1 bg-blue-900 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-800 transition disabled:opacity-50"
                        onClick={handleSave}
                    >
                        {isPending && <Spinner />}
                        {isPending ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </>
    );
};

export default ExpenseUpsertSheet;

/* helper */
const Field = ({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
}) => (
    <div>
        <label className="text-sm font-medium text-slate-700 mb-1 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);