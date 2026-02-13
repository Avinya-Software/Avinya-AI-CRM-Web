// src/components/tasks/TaskUpsertSheet.tsx
import { useState, useEffect } from "react";
import { X, Save, Loader2, Calendar, Bell } from "lucide-react";
import { useCreateTask, useUpdateTask } from "../../hooks/task/useTaskMutations";
import { Task, TaskStatus } from "../../interfaces/task.interface";
import ReminderModal from "./ReminderModal";
import RecurringModal from "./RecurringModal";
import { format } from "date-fns";

interface TaskUpsertSheetProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

const TaskUpsertSheet = ({ open, onClose, task }: TaskUpsertSheetProps) => {
  const isEdit = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    notes: "",
    dueDateTime: "",
    status: TaskStatus.Pending,
  });

  const [reminder, setReminder] = useState<{
    date: string;
    time: string;
    preset?: string;
  } | null>(null);

  const [recurring, setRecurring] = useState<{
    frequency: string;
    startsOn: string;
    repeatEvery: number;
    neverEnds: boolean;
    endsOn?: string;
    weekDays?: string[];
    monthDay?: number;
    yearMonth?: number;
    yearDay?: number;
  } | null | undefined>(null);

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        notes: task.notes || "",
        dueDateTime: task.dueDateTime != null ? task.dueDateTime.substring(0, 16) : "",
        status: task.status,
      });
    } else {
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
      setFormData({
        title: "",
        description: "",
        notes: "",
        dueDateTime: now.toISOString().substring(0, 16),
        status: TaskStatus.Pending,
      });
    }
    setReminder(null);
    setRecurring(null);
    setErrors({});
  }, [task, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.dueDateTime) newErrors.dueDateTime = "Due date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!validate()) return;

  //   // Build recurrence rule from recurring data
  //   let recurrenceRule = "";
  //   if (recurring) {
  //     recurrenceRule = `FREQ=${recurring.frequency.toUpperCase()}`;
  //     if (recurring.repeatEvery > 1) {
  //       recurrenceRule += `;INTERVAL=${recurring.repeatEvery}`;
  //     }
  //     if (!recurring.neverEnds && recurring.endsOn) {
  //       recurrenceRule += `;UNTIL=${recurring.endsOn}`;
  //     }
  //   }

  //   if (isEdit) {
  //     updateTask.mutate(
  //       {
  //         occurrenceId: task!.occurrenceId,
  //         data: {
  //           dueDateTime: formData.dueDateTime,
  //           status: formData.status,
  //         },
  //       },
  //       { onSuccess: () => onClose() }
  //     );
  //   } else {
  //     createTask.mutate(
  //       {
  //         title: formData.title,
  //         description: formData.description,
  //         notes: formData.notes,
  //         dueDateTime: formData.dueDateTime,
  //         isRecurring: !!recurring,
  //         recurrenceRule: recurrenceRule || undefined,
  //       },
  //       { onSuccess: () => onClose() }
  //     );
  //   }
  // };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Build recurrence rule from recurring data
    let recurrenceRule = "";
    if (recurring) {
      recurrenceRule = `FREQ=${recurring.frequency.toUpperCase()}`;

      if (recurring.repeatEvery > 1) {
        recurrenceRule += `;INTERVAL=${recurring.repeatEvery}`;
      }

      // Weekly: Add selected days
      if (recurring.frequency === "Weekly" && recurring.weekDays && recurring.weekDays.length > 0) {
        recurrenceRule += `;BYDAY=${recurring.weekDays.join(",")}`;
      }

      // Monthly: Add day of month
      if (recurring.frequency === "Monthly" && recurring.monthDay) {
        recurrenceRule += `;BYMONTHDAY=${recurring.monthDay}`;
      }

      // Yearly: Add month and day
      if (recurring.frequency === "Yearly") {
        if (recurring.yearMonth) {
          recurrenceRule += `;BYMONTH=${recurring.yearMonth}`;
        }
        if (recurring.yearDay) {
          recurrenceRule += `;BYMONTHDAY=${recurring.yearDay}`;
        }
      }

      if (!recurring.neverEnds && recurring.endsOn) {
        // Format: YYYYMMDD
        const endDate = recurring.endsOn.replace(/-/g, "");
        recurrenceRule += `;UNTIL=${endDate}T235959Z`;
      }
    }

    if (isEdit) {
      updateTask.mutate(
        {
          occurrenceId: task!.occurrenceId,
          data: {
            dueDateTime: formData.dueDateTime,
            status: formData.status,
          },
        },
        { onSuccess: () => onClose() }
      );
    } else {
      createTask.mutate(
        {
          title: formData.title,
          description: formData.description,
          notes: formData.notes,
          dueDateTime: formData.dueDateTime,
          isRecurring: !!recurring,
          recurrenceRule: recurrenceRule || undefined,
          recurrenceStartDate: recurring ? recurring.startsOn : "",
          recurrenceEndDate: recurring && !recurring.neverEnds ? recurring.endsOn : null,
          reminderAt: reminder
            ? new Date(`${reminder.date}T${reminder.time}`).toISOString()
            : undefined,
          reminderChannel: reminder ? "in-app" : "",
        },
        { onSuccess: () => onClose() }
      );
    }
  };

  const isLoading = createTask.isPending || updateTask.isPending;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              {isEdit ? "Edit Task" : "Add New Task"}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* TITLE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.title
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500"
                  }`}
                placeholder="What needs to be done?"
                disabled={isEdit}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* DESCRIPTION */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Add more details..."
                />
              </div>
            )}

            {/* NOTES */}
            {!isEdit && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Additional notes..."
                />
              </div>
            )}

            {/* DUE DATE & TIME */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Calendar size={14} className="inline mr-1" />
                Due Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dueDateTime}
                onChange={(e) =>
                  setFormData({ ...formData, dueDateTime: e.target.value })
                }
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.dueDateTime
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:ring-blue-500"
                  }`}
              />
              {errors.dueDateTime && (
                <p className="text-red-500 text-xs mt-1">{errors.dueDateTime}</p>
              )}
            </div>

            {/* STATUS (Edit only) */}
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as TaskStatus,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value={TaskStatus.Pending}>Pending</option>
                  <option value={TaskStatus.InProgress}>In Progress</option>
                  <option value={TaskStatus.Completed}>Completed</option>
                  <option value={TaskStatus.Cancelled}>Cancelled</option>
                </select>
              </div>
            )}

            {/* ADD REMINDER BUTTON */}
            {!isEdit && !reminder && !recurring && (
              <button
                type="button"
                onClick={() => setShowReminderModal(true)}
                className="w-full px-4 py-2.5 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center justify-center gap-2"
              >
                <Bell size={16} />
                Add Reminder
              </button>
            )}

            {/* REMINDER/RECURRING DISPLAY */}
            {!isEdit && (reminder || recurring) && (
              <div className="space-y-2">
                {reminder && (
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Bell size={14} />
                      <span className="font-medium">Reminder:</span>
                      <span>
                        {reminder.preset ||
                          `${format(new Date(reminder.date), "MMM dd")} at ${reminder.time}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowReminderModal(true)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setReminder(null)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {/* {recurring && (
                  <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                    <div className="text-sm text-purple-700">
                      <span className="font-medium">Recurring:</span>{" "}
                      {recurring.frequency}, every {recurring.repeatEvery}{" "}
                      {recurring.frequency.toLowerCase()}
                      {recurring.repeatEvery > 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRecurringModal(true)}
                        className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecurring(null)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )} */}

                {recurring && (
                  <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                    <div className="text-sm text-purple-700">
                      <span className="font-medium">Recurring:</span>{" "}
                      {recurring.frequency}
                      {recurring.frequency === "Weekly" && recurring.weekDays && recurring.weekDays.length > 0 && (
                        <> on {recurring.weekDays.join(", ")}</>
                      )}
                      {recurring.frequency === "Monthly" && recurring.monthDay && (
                        <> on day {recurring.monthDay}</>
                      )}
                      {recurring.frequency === "Yearly" && recurring.yearMonth && recurring.yearDay && (
                        <> on {months[recurring.yearMonth - 1]} {recurring.yearDay}</>
                      )}
                      , every {recurring.repeatEvery}{" "}
                      {recurring.frequency.toLowerCase()}
                      {recurring.repeatEvery > 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRecurringModal(true)}
                        className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecurring(null)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUBMIT BUTTONS */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {isEdit ? "Update" : "Create"} Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* REMINDER MODAL */}
      <ReminderModal
        open={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSave={(data) => {
          setReminder(data);
          setShowReminderModal(false);
        }}
        onOpenRecurring={() => {
          setShowReminderModal(false);
          setShowRecurringModal(true);
        }}
        initialData={reminder}
      />

      {/* RECURRING MODAL */}
      <RecurringModal
        open={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        onSave={(data) => {
          setRecurring(data);
          setShowRecurringModal(false);
        }}
        initialData={recurring}
        taskStartDate={formData.dueDateTime}
      />
    </>
  );
};

export default TaskUpsertSheet;