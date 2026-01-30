// src/components/tasks/TaskFilterSheet.tsx
import { X, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { TaskFilters, TaskStatus } from "../../interfaces/task.interface";

interface TaskFilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: TaskFilters;
  onApply: (filters: TaskFilters) => void;
  onClear: () => void;
}

const TaskFilterSheet = ({
  open,
  onClose,
  filters,
  onApply,
  onClear,
}: TaskFilterSheetProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Filter size={20} />
            <h2 className="text-xl font-semibold">Filter Tasks</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* FILTERS */}
        <div className="p-6 space-y-4">
          {/* STATUS */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={localFilters.status || ""}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  status: e.target.value ? (e.target.value as TaskStatus) : null,
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value={TaskStatus.Pending}>Pending</option>
              <option value={TaskStatus.InProgress}>In Progress</option>
              <option value={TaskStatus.Completed}>Completed</option>
              <option value={TaskStatus.Cancelled}>Cancelled</option>
            </select>
          </div>

          {/* DATE RANGE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={localFilters.from || ""}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, from: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={localFilters.to || ""}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, to: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 px-6 py-4 border-t bg-slate-50">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-white transition"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFilterSheet;