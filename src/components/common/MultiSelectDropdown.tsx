import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface Item {
  label: string;
  value: string;
}

interface Props {
  items: Item[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown = ({
  items,
  selectedValues,
  onChange,
  placeholder = "Select customers",
}: Props) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const allSelected =
    items.length > 0 && selectedValues.length === items.length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((i) =>
      i.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const toggleValue = (value: string) => {
    onChange(
      selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value]
    );
  };

  const toggleSelectAll = () => {
    onChange(allSelected ? [] : items.map((i) => i.value));
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="input w-full flex justify-between items-center"
      >
        <span className="truncate">
          {selectedValues.length === 0
            ? placeholder
            : `${selectedValues.length} selected`}
        </span>
        <ChevronDown size={16} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg">
          {/* Search */}
          <div className="p-2 border-b flex items-center gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {/* Select All */}
            <label className="flex items-center gap-2 px-3 py-2 border-b text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
              />
              <span>Select All</span>
            </label>

            {/* Items */}
            {filteredItems.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">
                No results found
              </div>
            )}

            {filteredItems.map((item) => (
              <label
                key={item.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(item.value)}
                  onChange={() => toggleValue(item.value)}
                />
                <span className="truncate">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
