import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLeadStatusesQuery } from "../../hooks/lead/useLeadStatuses";
import { useLeadSourcesQuery } from "../../hooks/lead/useLeadSources";
import Spinner from "../common/Spinner";
import type { LeadFilters } from "../../interfaces/lead.interface";
import { DatePicker, Select as AntSelect } from "antd";
import dayjs from "dayjs";

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
    const { data: statuses, isLoading: statusLoading } = useLeadStatusesQuery();
    const { data: sources, isLoading: sourceLoading } = useLeadSourcesQuery();
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
                                <AntSelect
                                    showSearch
                                    className="w-full h-10"
                                    value={localFilters.status || undefined}
                                    onChange={(val) => setLocalFilters({ ...localFilters, status: val })}
                                    placeholder="All Statuses"
                                    optionFilterProp="children"
                                    allowClear
                                >
                                    {statuses?.map((o: any) => (
                                        <AntSelect.Option key={o.id} value={o.id}>
                                            {o.name}
                                        </AntSelect.Option>
                                    ))}
                                </AntSelect>
                            </div>

                             {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Start Date
                                </label>
                                <DatePicker
                                    className="w-full h-10 border-slate-300 rounded-lg"
                                    format="YYYY-MM-DD"
                                    placeholder="Select start date"
                                    value={localFilters.startDate ? dayjs(localFilters.startDate) : null}
                                    onChange={(date, dateString) =>
                                        setLocalFilters(prev => ({ ...prev, startDate: Array.isArray(dateString) ? dateString[0] : dateString }))
                                    }
                                />
                            </div>
 
                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    End Date
                                </label>
                                <DatePicker
                                    className="w-full h-10 border-slate-300 rounded-lg"
                                    format="YYYY-MM-DD"
                                    placeholder="Select end date"
                                    value={localFilters.endDate ? dayjs(localFilters.endDate) : null}
                                    onChange={(date, dateString) =>
                                        setLocalFilters(prev => ({ ...prev, endDate: Array.isArray(dateString) ? dateString[0] : dateString }))
                                    }
                                />
                            </div>

                            {/* Page Size */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Records per page
                                </label>
                                <AntSelect
                                    className="w-full h-10"
                                    value={localFilters.pageSize || 10}
                                    onChange={(val) => setLocalFilters({ ...localFilters, pageSize: val })}
                                >
                                    <AntSelect.Option value={10}>10 per page</AntSelect.Option>
                                    <AntSelect.Option value={25}>25 per page</AntSelect.Option>
                                    <AntSelect.Option value={50}>50 per page</AntSelect.Option>
                                    <AntSelect.Option value={100}>100 per page</AntSelect.Option>
                                </AntSelect>
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
    <AntSelect
      showSearch
      className="w-full h-10"
      value={value || undefined}
      onChange={(val) => onChange(val)}
      placeholder="All"
      optionFilterProp="children"
      allowClear
    >
      {options?.map((o: any) => (
        <AntSelect.Option key={o.id} value={String(o.id)}>
          {o.name}
        </AntSelect.Option>
      ))}
    </AntSelect>
  </div>
);
