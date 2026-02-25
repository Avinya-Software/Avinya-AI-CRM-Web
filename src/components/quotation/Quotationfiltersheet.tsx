// src/components/quotations/QuotationFilterSheet.tsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { QuotationFilters, QuotationStatus } from "../../interfaces/quotation.interface";

interface QuotationFilterSheetProps {
    open: boolean;
    onClose: () => void;
    filters: QuotationFilters;
    onApply: (filters: QuotationFilters) => void;
    onClear: () => void;
}

const QuotationFilterSheet = ({
    open,
    onClose,
    filters,
    onApply,
    onClear,
}: QuotationFilterSheetProps) => {
    // Local state — changes don't hit API until "Apply" is clicked
    const [localFilters, setLocalFilters] = useState<QuotationFilters>(filters);

    // Sync local state when filters change externally (e.g. clear all)
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters, open]);

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
        setLocalFilters(prev => ({ ...prev, status: "", startDate: "", endDate: "" }));
        onClear();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={onClose}
                />
            )}

            {/* Side sheet — slides in from right */}
            <div
                className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${open ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">
                        Filter Quotations
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* Body — local changes only, no API calls */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Status
                        </label>
                        <select
                            value={localFilters.status || ""}
                            onChange={(e) =>
                                setLocalFilters(prev => ({
                                    ...prev,
                                    status: e.target.value as QuotationStatus | "",
                                }))
                            }
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="">All Statuses</option>
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={localFilters.startDate || ""}
                            onChange={(e) =>
                                setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))
                            }
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={localFilters.endDate || ""}
                            onChange={(e) =>
                                setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))
                            }
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {/* Page Size */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Records per page
                        </label>
                        <select
                            value={localFilters.pageSize}
                            onChange={(e) =>
                                setLocalFilters(prev => ({ ...prev, pageSize: Number(e.target.value) }))
                            }
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                    </div>
                </div>

                {/* Footer — API called ONLY here */}
                <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={handleClear}
                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-white transition text-sm font-medium text-slate-700"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default QuotationFilterSheet;