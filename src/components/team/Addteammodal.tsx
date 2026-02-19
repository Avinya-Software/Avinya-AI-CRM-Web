// AddTeamModal.tsx
import * as React from "react";
import { X, Loader2, Users, UserPlus, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { AddTeamModalProps } from "../../interfaces/team.interface";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface MultiComboboxProps {
  options: ComboboxOption[];
  values: string[];
  onValuesChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
}

function MultiCombobox({
  options,
  values,
  onValuesChange,
  placeholder = "Select users...",
  searchPlaceholder = "Search users...",
  className,
  disabled = false,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggle = (val: string) => {
    onValuesChange(
      values.includes(val) ? values.filter((v) => v !== val) : [...values, val]
    );
  };

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabels = options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label);

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition",
          "border-slate-300 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="truncate text-left text-slate-700">
          {selectedLabels.length === 0
            ? placeholder
            : selectedLabels.length === 1
            ? selectedLabels[0]
            : `${selectedLabels.length} users selected`}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {/* Chips */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {options
            .filter((o) => values.includes(o.value))
            .map((o) => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full"
              >
                {o.label}
                <button
                  type="button"
                  onClick={() => toggle(o.value)}
                  className="hover:text-blue-900 leading-none"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* List */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-slate-400">No users found.</li>
            ) : (
              filtered.map((opt) => {
                const selected = values.includes(opt.value);
                return (
                  <li
                    key={opt.value}
                    onClick={() => toggle(opt.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition",
                      selected
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition",
                        selected
                          ? "bg-blue-600 border-blue-600"
                          : "border-slate-300 bg-white"
                      )}
                    >
                      {selected && <Check size={10} className="text-white" />}
                    </span>
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   AddTeamModal
   ──────────────────────────────────────────── */

export function AddTeamModal({
  open,
  onClose,
  onTeamCreated,
  users,
  isLoading = false,
  onSave,
}: AddTeamModalProps) {
  const [name, setName] = React.useState("");
  const [memberIds, setMemberIds] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState<{ name?: string; members?: string }>({});

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setName("");
      setMemberIds([]);
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = "Team name is required";
    if (memberIds.length === 0) e.members = "Select at least one member";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({ name: name.trim(), userIds: memberIds });
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
              <Users size={16} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Create New Team</h3>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Team Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Team, Sales East..."
              className={cn(
                "w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2",
                errors.name
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-300 focus:ring-blue-500"
              )}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <UserPlus size={13} className="inline mr-1" />
              Add Members <span className="text-red-500">*</span>
            </label>
            <MultiCombobox
              options={users}
              values={memberIds}
              onValuesChange={setMemberIds}
              placeholder="Search and select members..."
              searchPlaceholder="Type to search users..."
            />
            {errors.members && (
              <p className="text-red-500 text-xs mt-1">{errors.members}</p>
            )}
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
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users size={15} />
                  Create Team
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTeamModal;