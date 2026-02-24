// src/components/quotations/QuotationFilterSheet.tsx
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
    if (!open) return null;

    const handleStatusChange = (status: QuotationStatus | "") => {
        onApply({ ...filters, status: status || undefined });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm mx-4 max-h-[80vh] overflow-y-auto">
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

                <div className="p-6 space-y-4">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status || ""}
                            onChange={(e) =>
                                handleStatusChange(e.target.value as QuotationStatus | "")
                            }
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="">All</option>
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate || ""}
                            onChange={(e) =>
                                onApply({ ...filters, startDate: e.target.value })
                            }
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate || ""}
                            onChange={(e) =>
                                onApply({ ...filters, endDate: e.target.value })
                            }
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={() => {
                            onClear();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-white transition text-sm font-medium text-slate-700"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuotationFilterSheet;