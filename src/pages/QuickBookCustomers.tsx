import { useEffect, useState } from "react";
import { X, Loader2, UserPlus, Users } from "lucide-react";
import {
    getQuickBooksCustomersApi,
    createQuickBooksCustomerApi,
    type CreateCustomerRequest,
} from "../api/Quickbooks.api";

// ─── cn utility ──────────────────────────────────────────────────────────────
function cn(...classes: (string | boolean | undefined | null)[]) {
    return classes.filter(Boolean).join(" ");
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CustomerForm {
    DisplayName: string;
    CompanyName: string;
    Email: string;
    Phone: string;
}

interface CustomerFormErrors {
    DisplayName?: string;
    Email?: string;
}

// ─── CreateCustomerModal ──────────────────────────────────────────────────────
interface CreateCustomerModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

function CreateCustomerModal({ open, onClose, onCreated }: CreateCustomerModalProps) {
    const [form, setForm] = useState<CustomerForm>({
        DisplayName: "",
        CompanyName: "",
        Email: "",
        Phone: "",
    });
    const [errors, setErrors] = useState<CustomerFormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setForm({ DisplayName: "", CompanyName: "", Email: "", Phone: "" });
            setErrors({});
        }
    }, [open]);

    const validate = () => {
        const e: CustomerFormErrors = {};
        if (!form.DisplayName.trim()) e.DisplayName = "Display name is required";
        if (form.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email))
            e.Email = "Enter a valid email address";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const body: CreateCustomerRequest = {
                DisplayName: form.DisplayName,
                CompanyName: form.CompanyName || undefined,
                PrimaryEmailAddr: form.Email ? { Address: form.Email } : undefined,
                PrimaryPhone: form.Phone ? { FreeFormNumber: form.Phone } : undefined,
            };

            await createQuickBooksCustomerApi(body);
            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

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
                            <UserPlus size={16} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Create New Customer</h3>
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
                    {/* Display Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Display Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.DisplayName}
                            onChange={(e) => setForm({ ...form, DisplayName: e.target.value })}
                            placeholder="e.g. John Smith"
                            className={cn(
                                "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2",
                                errors.DisplayName
                                    ? "border-red-400 focus:ring-red-400"
                                    : "border-slate-300 focus:ring-blue-500"
                            )}
                        />
                        {errors.DisplayName && (
                            <p className="text-red-500 text-xs mt-1">{errors.DisplayName}</p>
                        )}
                    </div>

                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={form.CompanyName}
                            onChange={(e) => setForm({ ...form, CompanyName: e.target.value })}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.Email}
                            onChange={(e) => setForm({ ...form, Email: e.target.value })}
                            placeholder="e.g. john@acme.com"
                            className={cn(
                                "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2",
                                errors.Email
                                    ? "border-red-400 focus:ring-red-400"
                                    : "border-slate-300 focus:ring-blue-500"
                            )}
                        />
                        {errors.Email && (
                            <p className="text-red-500 text-xs mt-1">{errors.Email}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Phone
                        </label>
                        <input
                            type="text"
                            value={form.Phone}
                            onChange={(e) => setForm({ ...form, Phone: e.target.value })}
                            placeholder="e.g. (555) 123-4567"
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

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
                            className="flex-1 px-4 py-2.5 btn-primary rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={15} />
                                    Create Customer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── QuickBookCustomers (main page) ──────────────────────────────────────────
const QuickBookCustomers = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
            const data = await getQuickBooksCustomersApi();
            const list = data?.data?.QueryResponse?.Customer || [];
            setCustomers(list);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingCustomers(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return (
        <div className="p-6">
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Users size={18} className="text-blue-600" />
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900">QuickBooks Customers</h1>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg text-sm font-medium transition"
                >
                    <UserPlus size={15} />
                    New Customer
                </button>
            </div>

            {/* Table */}
            {isLoadingCustomers ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                    <Loader2 size={22} className="animate-spin mr-2" />
                    Loading customers...
                </div>
            ) : customers.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                    No customers found.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Company
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Phone
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {customers.map((c, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition">
                                    <td className="px-4 py-3 text-sm text-slate-900">{c.DisplayName}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{c.CompanyName || "—"}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {c.PrimaryEmailAddr?.Address || "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-slate-600">
                                        {c.PrimaryPhone?.FreeFormNumber || "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Customer Modal */}
            <CreateCustomerModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreated={fetchCustomers}
            />
        </div>
    );
};

export default QuickBookCustomers;