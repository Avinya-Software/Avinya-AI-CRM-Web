import { useState, useEffect, useRef } from "react";
import { DatePicker, Select as AntSelect } from "antd";
import dayjs from "dayjs";
import { Filter, X, Eye, Loader2, WalletIcon , FileText, PackageOpen } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Invoice, InvoiceFilters } from "../interfaces/invoice.interface";
import { useInvoices, useDeleteInvoice, useInvoiceStatusDropdown } from "../hooks/invoice/useInvoices";
import { usePermissions } from "../context/PermissionContext";
import { useDebounce } from "../components/common/CommonHelper";
import Pagination from "../components/leads/Pagination";
import { downloadInvoicePdf } from "../api/invoice.api";
import { toast } from "react-hot-toast";
import InvoiceViewSheet from "../components/invoice/InvoiceViewSheet";
import PaymentCreateSheet from "../components/invoice/PaymentCreateSheet";
import { IndianRupee } from "lucide-react";


const DEFAULT_FILTERS: InvoiceFilters = {
    page: 1,
    pageSize: 10,
    search: "",
    status: "",
    startDate: "",
    endDate: "",
};


/* ================= MAIN PAGE ================= */
const Invoices = () => {
    const { hasPermission } = usePermissions();
    const canDelete = hasPermission("invoice", "delete") || true;

    const [filters, setFilters] = useState<InvoiceFilters>(DEFAULT_FILTERS);
    const [searchInput, setSearchInput] = useState("");
    const [openFilterSheet, setOpenFilterSheet] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<Invoice | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [openViewSheet, setOpenViewSheet] = useState(false);
    const [openPaymentSheet, setOpenPaymentSheet] = useState(false);
    const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);


    const debouncedSearchTerm = useDebounce(searchInput, 500);

    const invoicesMutation = useInvoices();
    const statusDropdownMutation = useInvoiceStatusDropdown();
    const deleteMutation = useDeleteInvoice();

    const fetchInvoices = () => {
        invoicesMutation.mutate(filters);
    };

    useEffect(() => {
        fetchInvoices();
    }, [filters]);

    useEffect(() => {
        statusDropdownMutation.mutate(undefined);
    }, []);

    const { data, isPending: isLoading } = invoicesMutation;
    const statusDropdown: any[] = statusDropdownMutation.data ?? [];
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        setFilters(prev => {
            if (prev.search === debouncedSearchTerm) return prev;
            return { ...prev, search: debouncedSearchTerm, page: 1 };
        });
    }, [debouncedSearchTerm]);

    const hasActiveFilters = filters.status || filters.startDate || filters.endDate;

    const clearAllFilters = () => {
        setSearchInput("");
        setFilters(DEFAULT_FILTERS);
    };

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setOpenViewSheet(true);
    };

    const handleViewPdf = async (invoice: Invoice) => {

        setDownloadingId(invoice.invoiceID);
        try {
            const blob = await downloadInvoicePdf(invoice.invoiceID);
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch {
            toast.error("Failed to open PDF preview");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDownloadPdf = async (invoice: Invoice) => {
        setDownloadingId(invoice.invoiceID);
        try {
            const blob = await downloadInvoicePdf(invoice.invoiceID);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Invoice_${invoice.invoiceNo}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("PDF Downloaded successfully");
        } catch {
            toast.error("Failed to download PDF");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleRecordPayment = (invoice: Invoice) => {
        setPaymentInvoice(invoice);
        setOpenPaymentSheet(true);
    };

    const handleDeleteConfirmed = () => {
        if (!confirmDelete) return;
        deleteMutation.mutate(confirmDelete.invoiceID);
        setConfirmDelete(null);
    };

    const tabs = [
        { id: "", name: "All" },
        ...statusDropdown.map((s: any) => ({
            id: String(s.invoiceStatusID),
            name: s.statusName || s.invoiceStatusName,
        })),
    ];

    const columns = ["Invoice No", "Customer", "Date", "Due Date", "Amount", "Status", "Actions"];

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />

            {/* MAIN CARD */}
            <div className="bg-white rounded-lg border">

                {/* HEADER */}
                <div className="px-4 py-5 border-b bg-gray-100">
                    <div className="grid grid-cols-2 gap-y-4 items-start">

                        <div>
                            <h1 className="text-4xl font-serif font-semibold text-slate-900">Invoices</h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {data?.totalRecords ?? 0} total invoices
                            </p>
                        </div>

                        {/* placeholder for right-side Add button if needed later */}
                        <div className="text-right" />

                        {/* SEARCH */}
                        <div>
                            <div className="relative w-[360px]">
                                <input
                                    type="text"
                                    placeholder="Search invoices..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                                {searchInput && (
                                    <button
                                        onClick={() => setSearchInput("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* FILTER */}
                        <div className="flex justify-end gap-2">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50"
                                >
                                    <X size={14} /> Clear Filters
                                </button>
                            )}
                            <button
                                onClick={() => setOpenFilterSheet(true)}
                                className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 relative"
                            >
                                <Filter size={16} />
                                Filter Invoice
                                {hasActiveFilters && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* STATUS TABS */}
                    <div className="flex items-center gap-1 mt-4 border-t pt-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id || "all"}
                                onClick={() => setFilters(prev => ({ ...prev, status: tab.id, page: 1 }))}
                                className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${String(filters.status) === String(tab.id)
                                        ? "btn-primary"
                                        : "text-slate-600 hover:bg-slate-200"
                                    }`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TABLE */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-slate-400">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm">Loading invoices…</span>
                        </div>
                    </div>
                ) : !data?.data?.length ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <PackageOpen size={40} strokeWidth={1.2} />
                        <p className="text-sm">No invoices found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                                    {columns.map((col) => (
                                        <th
                                            key={col}
                                            className={`px-4 py-3 font-medium whitespace-nowrap ${col === "Actions" ? "w-16 text-center" : "text-left"}`}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.data.map((invoice) => (
                                    <tr key={invoice.invoiceID} className="hover:bg-slate-50 transition-colors h-[52px]">

                                        <td className="px-4 py-3 font-medium text-slate-800">{invoice.invoiceNo ?? "—"}</td>

                                        <td className="px-4 py-3">
                                            <div className="text-slate-700 font-medium">{invoice.companyName || invoice.contactPerson || "—"}</div>
                                            {invoice.orderNo && (
                                                <div className="text-[11px] text-slate-400 uppercase tracking-wide">Order: {invoice.orderNo}</div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 text-slate-500">
                                            {invoice.invoiceDate ? dayjs(invoice.invoiceDate).format("DD/MM/YYYY") : "—"}
                                        </td>

                                        <td className="px-4 py-3 text-slate-500">
                                            {invoice.dueDate ? dayjs(invoice.dueDate).format("DD/MM/YYYY") : "—"}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-900">₹{invoice.grandTotal?.toFixed(2) ?? "0.00"}</div>
                                            {(invoice.remainingPayment ?? 0) > 0 && (
                                                <div className="text-[10px] font-bold text-amber-600 mt-0.5 uppercase tracking-tighter">
                                                    Bal: ₹{invoice.remainingPayment?.toFixed(2)}
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${invoice.invoiceStatusID === 2
                                                    ? "bg-green-100 text-green-700"
                                                    : invoice.invoiceStatusID === 4
                                                        ? "bg-red-100 text-red-700"
                                                        : invoice.invoiceStatusID === 3
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {invoice.statusName ?? "Pending"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* View PDF */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice); }}
                                                    className="p-1.5 rounded-full hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>


                                                {/* Download PDF */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDownloadPdf(invoice); }}
                                                    disabled={downloadingId === invoice.invoiceID}
                                                    className="p-1.5 rounded-full hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                                                    title="Download PDF"
                                                >
                                                    {downloadingId === invoice.invoiceID
                                                        ? <Loader2 size={16} className="animate-spin" />
                                                        : <FileText size={14} />
                                                    }
                                                </button>

                                                {/* Record Payment */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRecordPayment(invoice); }}
                                                    className="p-1.5 rounded-full hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 transition-colors"
                                                    title="Payment"
                                                >
                                                    <WalletIcon size={16} />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PAGINATION */}
                <div className="border-t px-4 py-3">
                    <Pagination
                        page={filters.page}
                        totalPages={data?.totalPages ?? 1}
                        onChange={(page) => setFilters(prev => ({ ...prev, page }))}
                    />
                </div>
            </div>

            {/* FILTER SHEET */}
            {openFilterSheet && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setOpenFilterSheet(false)} />
                    <div className="relative bg-white w-80 h-full shadow-xl p-6 overflow-y-auto flex flex-col gap-5">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Filter Invoices</h2>
                            <button onClick={() => setOpenFilterSheet(false)}>
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                            <AntSelect
                                showSearch
                                className="w-full h-10"
                                value={filters.status || undefined}
                                onChange={(val) => setFilters(prev => ({ ...prev, status: val, page: 1 }))}
                                placeholder="All Statuses"
                                optionFilterProp="children"
                                allowClear
                            >
                                {statusDropdown.map((s: any) => (
                                    <AntSelect.Option key={s.invoiceStatusID} value={String(s.invoiceStatusID)}>
                                        {s.statusName || s.invoiceStatusName}
                                    </AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                            <DatePicker
                                className="w-full h-10 rounded-lg border-slate-200"
                                format="YYYY-MM-DD"
                                placeholder="Select start date"
                                value={filters.startDate ? dayjs(filters.startDate) : null}
                                onChange={(date, dateString) =>
                                    setFilters(prev => ({ ...prev, startDate: Array.isArray(dateString) ? dateString[0] : dateString, page: 1 }))
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                            <DatePicker
                                className="w-full h-10 rounded-lg border-slate-200"
                                format="YYYY-MM-DD"
                                placeholder="Select end date"
                                value={filters.endDate ? dayjs(filters.endDate) : null}
                                onChange={(date, dateString) =>
                                    setFilters(prev => ({ ...prev, endDate: Array.isArray(dateString) ? dateString[0] : dateString, page: 1 }))
                                }
                            />
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <button
                                onClick={() => {
                                    setFilters(prev => ({ ...prev, status: "", startDate: "", endDate: "", page: 1 }));
                                    setOpenFilterSheet(false);
                                }}
                                className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-slate-50"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setOpenFilterSheet(false)}
                                className="flex-1 px-4 py-2 btn-primary rounded-lg text-sm"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* INVOICE VIEW SHEET */}
            <InvoiceViewSheet
                open={openViewSheet}
                onClose={() => { setOpenViewSheet(false); setSelectedInvoice(null); }}
                invoice={selectedInvoice}
                onDownload={selectedInvoice ? () => handleDownloadPdf(selectedInvoice) : undefined}
                onRecordPayment={selectedInvoice ? () => {
                    handleRecordPayment(selectedInvoice);
                    setOpenViewSheet(false);
                } : undefined}
            />

            {/* PAYMENT CREATE SHEET */}
            <PaymentCreateSheet
                open={openPaymentSheet}
                onClose={() => { setOpenPaymentSheet(false); setPaymentInvoice(null); }}
                invoice={paymentInvoice}
                onSuccess={() => {
                    // Refetch invoices to update outstanding amounts
                    fetchInvoices();
                }}
            />

            {/* DELETE CONFIRM MODAL */}

            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-lg font-semibold">Delete Invoice</h3>
                            <button onClick={() => setConfirmDelete(null)}><X size={18} /></button>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Delete invoice <b>{confirmDelete.invoiceNo}</b>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirmed}
                                className="px-4 py-2 btn-danger rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Invoices;
