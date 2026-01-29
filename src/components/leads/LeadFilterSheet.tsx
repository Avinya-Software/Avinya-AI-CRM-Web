import { useState, useEffect } from "react";
import { X } from "lucide-react";

import { useLeadStatuses } from "../../hooks/lead/useLeadStatuses";
import { useLeadSources } from "../../hooks/lead/useLeadSources";
import Spinner from "../common/Spinner";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: any;
  onApply: (filters: any) => void;
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

  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  if (!open) return null;

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
      />

      <div className="w-96 bg-white h-full shadow-xl flex flex-col">
        {/*   HEADER   */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            Filter Leads
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/*   BODY   */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Full Name"
                value={localFilters.fullName || ""}
                onChange={(v) =>
                  setLocalFilters({
                    ...localFilters,
                    fullName: v,
                  })
                }
                placeholder="Search by name"
              />

              <Input
                label="Email"
                value={localFilters.email || ""}
                onChange={(v) =>
                  setLocalFilters({
                    ...localFilters,
                    email: v,
                  })
                }
                placeholder="Search by email..."
              />

              <Input
                label="Mobile"
                value={localFilters.mobile || ""}
                onChange={(v) =>
                  setLocalFilters({
                    ...localFilters,
                    mobile: v,
                  })
                }
                placeholder="Search by mobile..."
              />

              <Select
                label="Lead Status"
                value={localFilters.leadStatusId || ""}
                options={statuses}
                onChange={(v) =>
                  setLocalFilters({
                    ...localFilters,
                    leadStatusId: v
                      ? Number(v)
                      : null,
                  })
                }
              />

              <Select
                label="Lead Source"
                value={localFilters.leadSourceId || ""}
                options={sources}
                onChange={(v) =>
                  setLocalFilters({
                    ...localFilters,
                    leadSourceId: v
                      ? Number(v)
                      : null,
                  })
                }
              />

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Page Size
                </label>
                <select
                  className="input"
                  value={localFilters.pageSize || 10}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      pageSize: Number(
                        e.target.value
                      ),
                    })
                  }
                >
                  <option value={10}>
                    10 per page
                  </option>
                  <option value={25}>
                    25 per page
                  </option>
                  <option value={50}>
                    50 per page
                  </option>
                  <option value={100}>
                    100 per page
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/*   FOOTER   */}
        <div className="px-6 py-4 border-t flex gap-3">
          <button
            className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
            onClick={handleClear}
            disabled={loading}
          >
            Clear All
          </button>
          <button
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
            onClick={handleApply}
            disabled={loading}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
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
