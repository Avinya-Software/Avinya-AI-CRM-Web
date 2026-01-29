import { useEffect, useRef, useState } from "react";

export interface ComboBoxItem {
  label: string;
  value: string;
}

interface Props<T extends ComboBoxItem> {
  /** Label shown above input */
  label?: string;

  /** Marks field required (UI only) */
  required?: boolean;

  /** Validation error message */
  error?: string;

  /** Disable interaction */
  disabled?: boolean;

  items: T[];
  value?: string;
  placeholder?: string;

  /** Called when an item is selected (or cleared) */
  onSelect: (item: T | null) => void;

  /** Optional create handler */
  onCreate?: (searchText: string) => void;

  /** Text shown when no results are found */
  emptyText?: string;

  /** Text for create button */
  createText?: string;
}

const SearchableComboBox = <T extends ComboBoxItem>({
  label,
  required,
  error,
  disabled,

  items,
  value,
  placeholder = "Select",
  onSelect,
  onCreate,
  emptyText = "No results found",
  createText = "Add new item",
}: Props<T>) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selected = items.find((i) => i.value === value);

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="w-full">
      {/* LABEL */}
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        ref={ref}
        className={`relative ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <input
          className={`input w-full placeholder:text-black
            ${selected ? "text-black-900" : "text-black-900"}
            ${error ? "border-red-500 focus:ring-red-500" : ""}
          `}
          placeholder={placeholder}
          value={open ? search : selected?.label || ""}
          disabled={disabled}
          onFocus={() => {
            if (disabled) return;
            setOpen(true);
            setSearch("");
          }}
          onChange={(e) => setSearch(e.target.value)}
        />

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow max-h-56 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.value}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-black-100 text-black-900"
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </div>
              ))
            ) : (
              <div className="p-3 text-sm text-black-500">
                {emptyText}

                {onCreate && search && (
                  <button
                    type="button"
                    className="mt-2 w-full border rounded-md py-1 text-blue-600 hover:bg-blue-50"
                    onClick={() => onCreate(search)}
                  >
                    + {createText}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default SearchableComboBox;
