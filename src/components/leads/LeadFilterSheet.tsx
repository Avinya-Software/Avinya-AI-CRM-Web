import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLeadStatuses } from "../../hooks/lead/useLeadStatuses";
import { useLeadSources } from "../../hooks/lead/useLeadSources";
import Spinner from "../common/Spinner";
import type { LeadFilters } from "../../interfaces/lead.interface";

interface Props {
    open: boolean;
    onClose: () => void;
    filters: LeadFilters;
    onApply: (filters: LeadFilters) => void;
    onClear: () => void;
}

const LeadFilterSheet = ({
    open,
    onClose,
    filters,
    onApply,
    onClear,
}: Props) => {
    const {
        data: statuses,
        isLoading: statusLoading,
    } = useLeadStatuses();

    const {
        data: sources,
        isLoading: sourceLoading,
    } = useLeadSources();

    const loading = statusLoading || sourceLoading;

    // Local state — changes don't hit API until "Apply" is clicked
    const [localFilters, setLocalFilters] = useState<LeadFilters>(filters);

    // Sync local state when filters change externally (e.g. clear all)
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters, open]);

    const handleApply = () => {
        onApply(localFilters);
        onClose();
    };

    const handleClear = () => {
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
                        Filter Leads
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
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Spinner />
                        </div>
                    ) : (
                        <>
                            {/* Lead Status */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Lead Status
                                </label>
                                <select
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={localFilters.status || ""}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            status: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">All Statuses</option>
                                    {statuses?.map((o: any) => (
                                        <option key={o.id} value={o.id}>
                                            {o.name}
                                        </option>
                                    ))}
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
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    value={localFilters.pageSize || 10}
                                    onChange={(e) =>
                                        setLocalFilters({
                                            ...localFilters,
                                            pageSize: Number(e.target.value),
                                        })
                                    }
                                >
                                    <option value={10}>10 per page</option>
                                    <option value={25}>25 per page</option>
                                    <option value={50}>50 per page</option>
                                    <option value={100}>100 per page</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer — API called ONLY here */}
                <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={handleClear}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-white transition text-sm font-medium text-slate-700 disabled:opacity-50"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 btn-primary rounded-lg transition text-sm font-medium disabled:opacity-50"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default LeadFilterSheet;

/*  Helpers  */

const Input = ({
  label,
  value,
  onChange,
  placeholder,
}: any) => (
  <div className="space-y-1">
    <label className="text-sm font-medium">
      {label}
    </label>
    <input
      className="input w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const Select = ({
  label,
  value,
  options,
  onChange,
}: any) => (
  <div className="space-y-1">
    <label className="text-sm font-medium">
      {label}
    </label>
    <select
      className="input w-full"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">All</option>
      {options?.map((o: any) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
  </div>
);
