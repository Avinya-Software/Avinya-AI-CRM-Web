import { useEffect, useRef, useState } from "react";
import { DatePicker, Select as AntSelect } from "antd";
import dayjs from "dayjs";
import { X, Upload, FileText, XCircle } from "lucide-react";
import toast from "react-hot-toast";

import Spinner from "../common/Spinner";
import { usePermissions } from "../../context/PermissionContext";
import { Expense } from "../../interfaces/expense.interface";
import { useUpsertExpense } from "../../hooks/expense/useUpsertExpense";

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

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
const MAX_SIZE_MB = 5;

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialForm = {
        expenseID: null as string | null,
        expenseDate: today,
        expenseType: "",
        amount: "" as number | string,
        description: "",
        status: "pending",
        remarks: "",
    };

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [existingReceiptUrl, setExistingReceiptUrl] = useState<string>("");
    const [dragOver, setDragOver] = useState(false);

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
                expenseType: expense.expenseCategory?.categoryName ?? "",
                amount: expense.amount ?? "",
                description: expense.description ?? "",
                status: expense.status ? expense.status.toLowerCase() : "pending",
                remarks: expense.remarks ?? "",
            });
            
            const baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "");
            const fileUrl = expense.receiptPath 
                ? (expense.receiptPath.startsWith('http') ? expense.receiptPath : `${baseUrl}${expense.receiptPath}`)
                : "";
            setExistingReceiptUrl(fileUrl);
        } else {
            setForm(initialForm);
            setExistingReceiptUrl("");
        }

        setReceiptFile(null);
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

    const handleFileChange = (file: File | null) => {
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error("Only JPG, PNG, or PDF files are allowed");
            return;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`File size must be under ${MAX_SIZE_MB}MB`);
            return;
        }
        setReceiptFile(file);
        setExistingReceiptUrl("");
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0] ?? null;
        handleFileChange(file);
    };

    const handleRemoveFile = () => {
        setReceiptFile(null);
        setExistingReceiptUrl("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSave = async () => {
        if (!hasAccess) { toast.error("Permission denied"); return; }
        if (!validate()) return;

        const payload = {
            expenseID: form.expenseID,
            expenseDate: form.expenseDate,
            expenseType: form.expenseType,
            amount: Number(form.amount),
            description: form.description.trim(),
            status: form.status,
            remarks: form.remarks.trim(),
            receiptFile: receiptFile || null,
            receiptUrl: !receiptFile ? existingReceiptUrl : null,
        };

        await mutateAsync(payload as any);
        toast.success(`Expense ${expense ? "updated" : "added"} successfully`);
        onClose();
        onSuccess();
    };

    if (!open || !hasAccess) return null;

    const hasReceipt = receiptFile || existingReceiptUrl;

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

                    {/* Date + Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-700 mb-1 block">
                                Expense Date <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                className={`w-full h-10 rounded-lg ${errors.expenseDate ? "border-red-500" : "border-slate-200"}`}
                                format="YYYY-MM-DD"
                                placeholder="Select expense date"
                                value={form.expenseDate ? dayjs(form.expenseDate) : null}
                                onChange={(date, dateString) =>
                                    setForm({ ...form, expenseDate: Array.isArray(dateString) ? dateString[0] : dateString })
                                }
                            />
                            {errors.expenseDate && <p className="text-xs text-red-500 mt-1">{errors.expenseDate}</p>}
                        </div>

                        <Field label="Expense Type" required error={errors.expenseType}>
                            <AntSelect
                                showSearch
                                className={`w-full h-10 ${errors.expenseType ? "ant-select-error" : ""}`}
                                value={form.expenseType || undefined}
                                onChange={(val) => setForm({ ...form, expenseType: val })}
                                placeholder="Select Type"
                                optionFilterProp="children"
                            >
                                {EXPENSE_TYPES.map((t) => (
                                    <AntSelect.Option key={t} value={t}>{t}</AntSelect.Option>
                                ))}
                            </AntSelect>
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

                    {/* Receipt Upload */}
                    <Field label="Receipt / Bill">
                        {!hasReceipt ? (
                            <div
                                className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${dragOver
                                    ? "border-blue-400 bg-blue-50"
                                    : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                    }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
                                <Upload size={22} className="mx-auto text-slate-400 mb-2" />
                                <p className="text-sm font-medium text-slate-600">
                                    Click to upload or drag & drop
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    JPG, PNG, PDF — max {MAX_SIZE_MB}MB
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                                />
                            </div>
                        ) : (
                            <div className="border rounded-lg px-4 py-3 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="shrink-0 w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FileText size={18} className="text-blue-700" />
                                    </div>
                                    <div className="min-w-0">
                                        {receiptFile ? (
                                            <>
                                                <p className="text-sm font-medium text-slate-700 truncate">
                                                    {receiptFile.name}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {(receiptFile.size / 1024).toFixed(1)} KB
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium text-slate-700 truncate">
                                                    Existing receipt
                                                </p>
                                                <a
                                                    href={existingReceiptUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-blue-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    View file
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="shrink-0 ml-2 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Remove file"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        )}
                    </Field>

                    {/* Status (edit only) */}
                    {isEdit && (
                        <Field label="Status">
                            <AntSelect
                                className="w-full h-10"
                                value={form.status}
                                onChange={(val) => setForm({ ...form, status: val })}
                            >
                                <AntSelect.Option value="pending">Pending</AntSelect.Option>
                                <AntSelect.Option value="approved">Approved</AntSelect.Option>
                                <AntSelect.Option value="rejected">Rejected</AntSelect.Option>
                                <AntSelect.Option value="paid">Paid</AntSelect.Option>
                            </AntSelect>
                        </Field>
                    )}

                    {/* Remarks (edit only) */}
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
                        className="flex-1 btn-primary rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
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