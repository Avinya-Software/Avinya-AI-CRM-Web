// src/components/tasks/ReminderModal.tsx
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Repeat } from "lucide-react";
import { format, addDays, addWeeks } from "date-fns";

interface ReminderModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { date: string; time: string; preset?: string }) => void;
  onOpenRecurring: () => void;
  initialData: { date: string; time: string; preset?: string } | null;
}

const ReminderModal = ({
  open,
  onClose,
  onSave,
  onOpenRecurring,
  initialData,
}: ReminderModalProps) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    if (open) {
      if (initialData) {
        setDate(initialData.date);
        setTime(initialData.time);
      } else {
        const now = new Date();
        setDate(format(now, "yyyy-MM-dd"));
        setTime(format(now, "HH:mm"));
        setSelectedMonth(now);
      }
    }
  }, [open, initialData]);

  const handlePreset = (preset: string) => {
    const now = new Date();
    let targetDate = now;

    switch (preset) {
      case "Tomorrow":
        targetDate = addDays(now, 1);
        break;
      case "Next week":
        targetDate = addWeeks(now, 1);
        break;
      case "Someday":
        targetDate = addDays(now, 7);
        break;
    }

    onSave({
      date: format(targetDate, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
      preset,
    });
  };

  if (!open) return null;

  // Calendar generation
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
    });
  }

  const selectedDate = date ? new Date(date).getDate() : null;
  const selectedYear = date ? new Date(date).getFullYear() : null;
  const selectedMonthNum = date ? new Date(date).getMonth() : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Reminder</h2>
        </div>

        <div className="p-6 space-y-4">
          {/* DATE & TIME INPUTS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                DATE
              </label>
              <input
                type="text"
                value={date ? format(new Date(date), "M.dd.yyyy") : ""}
                readOnly
                className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                TIME
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-lg text-slate-900 font-medium"
              />
            </div>
          </div>

          {/* CALENDAR */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {format(selectedMonth, "MMMM yyyy")}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setSelectedMonth(
                      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1)
                    )
                  }
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronLeft size={18} className="text-slate-600" />
                </button>
                <button
                  onClick={() =>
                    setSelectedMonth(
                      new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1)
                    )
                  }
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronRight size={18} className="text-slate-600" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-slate-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayObj, idx) => {
                const isSelected =
                  dayObj.isCurrentMonth &&
                  dayObj.day === selectedDate &&
                  year === selectedYear &&
                  month === selectedMonthNum;

                const isToday =
                  dayObj.isCurrentMonth &&
                  dayObj.day === new Date().getDate() &&
                  year === new Date().getFullYear() &&
                  month === new Date().getMonth();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (dayObj.isCurrentMonth) {
                        setDate(
                          format(new Date(year, month, dayObj.day), "yyyy-MM-dd")
                        );
                      }
                    }}
                    className={`aspect-square flex items-center justify-center text-sm rounded-lg transition font-medium ${
                      !dayObj.isCurrentMonth
                        ? "text-slate-300"
                        : isSelected
                        ? "bg-blue-500 text-white"
                        : isToday
                        ? "bg-blue-100 text-blue-600"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {dayObj.day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PRESET BUTTONS */}
          <div className="space-y-1 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => handlePreset("Tomorrow")}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-50 rounded-lg transition text-sm font-medium text-slate-700"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handlePreset("Next week")}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-50 rounded-lg transition text-sm font-medium text-slate-700"
            >
              Next week
            </button>
            <button
              type="button"
              onClick={() => handlePreset("Someday")}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-50 rounded-lg transition text-sm font-medium text-slate-700"
            >
              Someday
            </button>
            <button
              type="button"
              onClick={onOpenRecurring}
              className="w-full px-4 py-2.5 text-left hover:bg-slate-50 rounded-lg transition text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <Repeat size={16} className="text-slate-500" />
              Recurring
            </button>
          </div>
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
            onClick={() => onSave({ date, time })}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;