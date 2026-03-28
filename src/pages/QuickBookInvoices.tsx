import { useEffect, useState } from "react";
import { X, Loader2, FileText, Plus } from "lucide-react";
import {
    getQuickBooksInvoicesApi,
    createQuickBooksInvoiceApi,
    type CreateInvoiceRequest,
} from "../api/Quickbooks.api";

// ─── cn utility ──────────────────────────────────────────────────────────────
function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(" ");
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface InvoiceForm {
    customerId: string;
    itemId: string;
    qty: string;
    price: string;
}

interface InvoiceFormErrors {
    customerId?: string;
    itemId?: string;
    qty?: string;
    price?: string;
}

// ─── CreateInvoiceModal ───────────────────────────────────────────────────────
interface CreateInvoiceModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

function CreateInvoiceModal({ open, onClose, onCreated }: CreateInvoiceModalProps) {
    const [form, setForm] = useState<InvoiceForm>({
        customerId: "",
        itemId: "",
        qty: "",
        price: "",
    });
    const [errors, setErrors] = useState<InvoiceFormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setForm({ customerId: "", itemId: "", qty: "", price: "" });
            setErrors({});
        }
    }, [open]);

    const validate = () => {
        const e: InvoiceFormErrors = {};
        if (!form.customerId.trim()) e.customerId = "Customer ID is required";
        if (!form.itemId.trim()) e.itemId = "Item ID is required";
        if (!form.qty || isNaN(Number(form.qty)) || Number(form.qty) <= 0)
            e.qty = "Enter a valid quantity";
        if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
            e.price = "Enter a valid unit price";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const qty = Number(form.qty);
            const price = Number(form.price);

            const body: CreateInvoiceRequest = {
                CustomerRef: { value: form.customerId },
                Line: [
                    {
                        Amount: qty * price,
                        DetailType: "SalesItemLineDetail",
                        SalesItemLineDetail: {
                            ItemRef: { value: form.itemId },
                            Qty: qty,
                            UnitPrice: price,
                        },
                    },
                ],
            };

            await createQuickBooksInvoiceApi(body);
            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const totalAmount =
        form.qty && form.price && !isNaN(Number(form.qty)) && !isNaN(Number(form.price))
            ? (Number(form.qty) * Number(form.price)).toFixed(2)
            : null;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <FileText size={16} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Create New Invoice</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Customer ID */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Customer ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.customerId}
                            onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                            placeholder="e.g. 1"
                            className={cn(
                                "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2",
                                errors.customerId
                                    ? "border-red-400 focus:ring-red-400"
                                    : "border-slate-300 focus:ring-blue-500"
                            )}
                        />
                        {errors.customerId && (
                            <p className="text-red-500 text-xs mt-1">{errors.customerId}</p>
                        )}
                    </div>

                    {/* Item ID */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Item ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.itemId}
                            onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                            placeholder="e.g. 2"
                            className={cn(
                                "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2",
                                errors.itemId
                                    ? "border-red-400 focus:ring-red-400"
                                    : "border-slate-300 focus:ring-blue-500"
                            )}
                        />
                        {errors.itemId && (
                            <p className="text-red-500 text-xs mt-1">{errors.itemId}</p>
                        )}
                    </div>

                    {/* Qty + Price side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={form.qty}
                                onChange={(e) => setForm({ ...form, qty: e.target.value })}
                                placeholder="e.g. 3"
                                min="1"
                                className={cn(
                                    "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2",
                                    errors.qty
                                        ? "border-red-400 focus:ring-red-400"
                                        : "border-slate-300 focus:ring-blue-500"
                                )}
                            />
                            {errors.qty && (
                                <p className="text-red-500 text-xs mt-1">{errors.qty}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Unit Price <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={(e) => setForm({ ...form, price: e.target.value })}
                                placeholder="e.g. 50.00"
                                min="0"
                                step="0.01"
                                className={cn(
                                    "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2",
                                    errors.price
                                        ? "border-red-400 focus:ring-red-400"
                                        : "border-slate-300 focus:ring-blue-500"
                                )}
                            />
                            {errors.price && (
                                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                            )}
                        </div>
                    </div>

                    {/* Live total preview */}
                    {totalAmount && (
                        <div className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                            <span className="text-sm text-slate-600">Total Amount</span>
                            <span className="text-sm font-semibold text-blue-700">${totalAmount}</span>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <FileText size={15} />
                                    Create Invoice
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── QuickBookInvoices (main page) ────────────────────────────────────────────
const QuickBookInvoices = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchInvoices = async () => {
        setIsLoadingInvoices(true);
        try {
            const data = await getQuickBooksInvoicesApi();
            const list = data?.data?.QueryResponse?.Invoice || [];
            setInvoices(list);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    return (
        <div className="p-6">
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText size={18} className="text-blue-600" />
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900">QuickBooks Invoices</h1>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition"
                >
                    <Plus size={15} />
                    New Invoice
                </button>
            </div>

            {/* Table */}
            {isLoadingInvoices ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                    <Loader2 size={22} className="animate-spin mr-2" />
                    Loading invoices...
                </div>
            ) : invoices.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                    No invoices found.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Invoice No
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {invoices.map((i, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 text-sm text-slate-900">
                                        {i.DocNumber || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {i.CustomerRef?.name || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        ${i.TotalAmt?.toFixed(2) ?? "0.00"}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span
                                            className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                                i.Balance === 0
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-amber-100 text-amber-700"
                                            )}
                                        >
                                            {i.Balance === 0 ? "Paid" : "Open"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Invoice Modal */}
            <CreateInvoiceModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={fetchInvoices}
            />
        </div>
    );
};

export default QuickBookInvoices;