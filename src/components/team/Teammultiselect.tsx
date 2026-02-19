// src/components/teams/TeamMultiSelect.tsx
import { useState, useEffect, useRef } from "react";
import { X, UserPlus } from "lucide-react";
import { TeamMultiSelectProps } from "../../interfaces/team.interface";

export interface SelectOption {
  value: string;
  label: string;
}

const TeamMultiSelect = ({
  options,
  values,
  onChange,
  placeholder = "Search and select members...",
  searchPlaceholder = "Type to search...",
  excludeIds = [],
  disabled = false,
}: TeamMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter(
    (o) =>
      !excludeIds.includes(o.value) &&
      o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (val: string) =>
    onChange(
      values.includes(val) ? values.filter((v) => v !== val) : [...values, val]
    );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedOptions = options.filter((o) => values.includes(o.value));

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setOpen((p) => !p)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition bg-white
          ${disabled ? "opacity-50 cursor-not-allowed border-slate-200" : "hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border-slate-300 cursor-pointer"}
        `}
      >
        <span className="text-slate-500 truncate text-left">
          {selectedOptions.length === 0
            ? placeholder
            : selectedOptions.length === 1
              ? selectedOptions[0].label
              : `${selectedOptions.length} users selected`}
        </span>
        <UserPlus size={14} className="text-slate-400 shrink-0 ml-2" />
      </button>

      {/* Selected Chips */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedOptions.map((o) => (
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
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Options List */}
          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-sm text-slate-400 text-center">
                No users found
              </li>
            ) : (
              filtered.map((opt) => {
                const isSelected = values.includes(opt.value);
                return (
                  <li
                    key={opt.value}
                    onClick={() => toggle(opt.value)}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm transition select-none
                      ${isSelected ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}
                    `}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition
                        ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}
                      `}
                    >
                      {isSelected && (
                        <X size={9} className="text-white" strokeWidth={3} />
                      )}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeamMultiSelect;