import React from "react";

interface DateInputProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  name?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  name,
  className = "",
  required = false,
  disabled = false,
}) => {
  const handleClick = (
    e: React.MouseEvent<HTMLInputElement>
  ) => {
    const input = e.currentTarget;

    // Focus first (Safari support)
    input.focus();

    // Open picker if supported (Chrome / Edge)
    if (input.showPicker) {
      input.showPicker();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <input
        type="date"
        name={name}
        value={value || ""}
        disabled={disabled}
        required={required}
        onClick={handleClick}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full rounded-md border border-slate-300
          px-3 py-2 text-sm
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-green-500
          disabled:bg-slate-100 disabled:cursor-not-allowed
          ${className}
        `}
      />
    </div>
  );
};

export default DateInput;
