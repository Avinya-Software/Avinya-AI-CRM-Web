// src/components/tasks/RecurringModal.tsx
import { useState, useEffect } from "react";
import { X, Calendar, ChevronDown } from "lucide-react";
import { format } from "date-fns";

interface RecurringModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    frequency: string;
    startsOn: string;
    repeatEvery: number;
    neverEnds: boolean;
    endsOn?: string;
    weekDays?: string[];
    monthDay?: number;
    yearMonth?: number;
    yearDay?: number;
  }) => void;
  initialData: any;
  taskStartDate: string;
}

const RecurringModal = ({
  open,
  onClose,
  onSave,
  initialData,
  taskStartDate,
}: RecurringModalProps) => {
  const [frequency, setFrequency] = useState("Daily");
  const [startsOn, setStartsOn] = useState("");
  const [repeatEvery, setRepeatEvery] = useState(1);
  const [neverEnds, setNeverEnds] = useState(true);
  const [endsOn, setEndsOn] = useState("");

  // Weekly: Selected days
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Monthly: Day of month (1-31)
  const [monthDay, setMonthDay] = useState(1);

  // Yearly: Month and day
  const [yearMonth, setYearMonth] = useState(1);
  const [yearDay, setYearDay] = useState(1);

  const weekDays = [
    { short: "Su", full: "Sunday", value: "SU" },
    { short: "Mo", full: "Monday", value: "MO" },
    { short: "Tu", full: "Tuesday", value: "TU" },
    { short: "We", full: "Wednesday", value: "WE" },
    { short: "Th", full: "Thursday", value: "TH" },
    { short: "Fr", full: "Friday", value: "FR" },
    { short: "Sa", full: "Saturday", value: "SA" },
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFrequency(initialData.frequency);
        setStartsOn(initialData.startsOn);
        setRepeatEvery(initialData.repeatEvery);
        setNeverEnds(initialData.neverEnds);
        setEndsOn(initialData.endsOn || "");
        setSelectedDays(initialData.weekDays || []);
        setMonthDay(initialData.monthDay || 1);
        setYearMonth(initialData.yearMonth || 1);
        setYearDay(initialData.yearDay || 1);
      } else {
        setFrequency("Daily");
        setStartsOn(
          taskStartDate
            ? taskStartDate.substring(0, 10)
            : format(new Date(), "yyyy-MM-dd")
        );
        setRepeatEvery(1);
        setNeverEnds(true);
        setEndsOn("");
        setSelectedDays([]);
        setMonthDay(1);
        setYearMonth(1);
        setYearDay(1);
      }
    }
  }, [open, initialData, taskStartDate]);

  const toggleDay = (dayValue: string) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue)
        ? prev.filter((d) => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleSave = () => {
    onSave({
      frequency,
      startsOn,
      repeatEvery,
      neverEnds,
      endsOn: neverEnds ? undefined : endsOn,
      weekDays: frequency === "Weekly" ? selectedDays : undefined,
      monthDay: frequency === "Monthly" ? monthDay : undefined,
      yearMonth: frequency === "Yearly" ? yearMonth : undefined,
      yearDay: frequency === "Yearly" ? yearDay : undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Recurring</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* FREQUENCY BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            {["Daily", "Weekly", "Monthly", "Yearly"].map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={`px-4 py-3 rounded-lg border-2 transition text-sm font-semibold flex items-center justify-center gap-2 ${frequency === freq
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
              >
                <Calendar size={16} />
                {freq}
              </button>
            ))}
          </div>

          {/* STARTS ON */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Starts On
            </label>
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-blue-600 font-medium text-sm">
                {startsOn
                  ? format(
                    new Date(
                      startsOn + "T" + (taskStartDate?.substring(11, 16) || "12:00")
                    ),
                    "MMM dd, yyyy, h:mm a"
                  )
                  : ""}
              </span>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>

          {/* REPEAT EVERY */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Repeat Every
            </label>
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-blue-600 font-medium text-sm">
                {repeatEvery} {frequency === "Weekly" ? "Week" : frequency === "Monthly" ? "Month" : frequency === "Yearly" ? "Year" : "Day"}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={repeatEvery}
                  onChange={(e) => setRepeatEvery(parseInt(e.target.value) || 1)}
                  className="w-16 text-right bg-transparent focus:outline-none text-blue-600 font-medium"
                />
                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </div>
          </div>

          {/* WEEKLY: DAY SELECTOR */}
          {frequency === "Weekly" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Repeats On
              </label>
              <div className="flex gap-2 justify-between">
                {weekDays.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition ${selectedDays.includes(day.value)
                        ? "bg-blue-500 text-white"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                    title={day.full}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MONTHLY: DAY OF MONTH */}
          {frequency === "Monthly" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Day of Month
              </label>
              <select
                value={monthDay}
                onChange={(e) => setMonthDay(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-500"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* YEARLY: MONTH AND DAY */}
          {frequency === "Yearly" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Month
                </label>
                <select
                  value={yearMonth}
                  onChange={(e) => setYearMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                >
                  {months.map((month, idx) => (
                    <option key={idx} value={idx + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Day
                </label>
                <select
                  value={yearDay}
                  onChange={(e) => setYearDay(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Day {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* NEVER ENDS TOGGLE */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-slate-700">
              Task never ends
            </span>
            <button
              type="button"
              onClick={() => setNeverEnds(!neverEnds)}
              className={`relative w-12 h-6 rounded-full transition ${neverEnds ? "bg-blue-600" : "bg-slate-300"
                }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition transform shadow-sm ${neverEnds ? "translate-x-6" : "translate-x-0"
                  }`}
              />
            </button>
          </div>

          {/* ENDS ON (if not never ends) */}
          {!neverEnds && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ends On
              </label>
              <input
                type="date"
                value={endsOn}
                onChange={(e) => setEndsOn(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border-2 border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-white transition font-medium text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringModal;