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

import { DatePicker } from "antd";
import dayjs from "dayjs";

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  className = "",
  required = false,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <DatePicker
        className={`w-full h-10 rounded-md border-slate-300 ${className}`}
        format="YYYY-MM-DD"
        placeholder="Select date"
        value={value ? dayjs(value) : null}
        disabled={disabled}
        onChange={(date, dateString) => onChange(Array.isArray(dateString) ? dateString[0] : dateString)}
      />
    </div>
  );
};

export default DateInput;
