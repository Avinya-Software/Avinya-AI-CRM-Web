// src/components/followups/LeadFollowUpCreateSheet.tsx
import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { useCreateFollowUp } from "../../hooks/followup/useFollowUpMutations";
import { useUsersDropdown } from "../../hooks/users/Useusers";
interface LeadFollowUpCreateSheetProps {
  open: boolean;
  leadId: string | null;
  leadName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const LeadFollowUpCreateSheet = ({
  open,
  leadId,
  leadName,
  onClose,
  onSuccess,
}: LeadFollowUpCreateSheetProps) => {
  const [formData, setFormData] = useState({
    followUpDate: "",
    notes: "",
    nextFollowUpDate: "",
    followUpBy: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createFollowUp = useCreateFollowUp();
  const { data: employees } = useUsersDropdown();

  useEffect(() => {
    if (open) {
      // Set default follow-up date to today
      const today = new Date().toISOString().substring(0, 10);
      setFormData({
        followUpDate: today,
        notes: "",
        nextFollowUpDate: "",
        followUpBy: "",
      });
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.followUpDate) {
      newErrors.followUpDate = "Follow-up date is required";
    }
    if (!formData.notes.trim()) {
      newErrors.notes = "Notes are required";
    }
    if (!formData.followUpBy) {
      newErrors.followUpBy = "Follow-up by is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !leadId) return;

    createFollowUp.mutate(
      {
        leadId,
        followUpDate: formData.followUpDate,
        notes: formData.notes,
        nextFollowUpDate: formData.nextFollowUpDate || undefined,
        followUpBy: formData.followUpBy,
      },
      {
        onSuccess: () => {
          onSuccess?.();
          onClose();
        },
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Add Lead Follow-Up
            </h2>
            {leadName && (
              <p className="text-sm text-slate-500 mt-0.5">
                Add follow-up details for <span className="font-medium text-slate-700">{leadName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Follow-Up Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Follow-Up Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.followUpDate}
              onChange={(e) =>
                setFormData({ ...formData, followUpDate: e.target.value })
              }
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.followUpDate
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500"
                }`}
            />
            {errors.followUpDate && (
              <p className="text-red-500 text-xs mt-1">{errors.followUpDate}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              placeholder="Enter follow-up notes"
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm resize-none ${errors.notes
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500"
                }`}
            />
            {errors.notes && (
              <p className="text-red-500 text-xs mt-1">{errors.notes}</p>
            )}
          </div>

          {/* Next Follow-Up Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Next Follow-Up Date
            </label>
            <input
              type="date"
              value={formData.nextFollowUpDate}
              onChange={(e) =>
                setFormData({ ...formData, nextFollowUpDate: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Follow-Up By */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Follow-Up By <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.followUpBy}
              onChange={(e) =>
                setFormData({ ...formData, followUpBy: e.target.value })
              }
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.followUpBy
                ? "border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:ring-blue-500"
                }`}
            >
              <option value="">Select employee</option>
              {employees?.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} - {emp.email}
                </option>
              ))}
            </select>
            {errors.followUpBy && (
              <p className="text-red-500 text-xs mt-1">{errors.followUpBy}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700"
              disabled={createFollowUp.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createFollowUp.isPending}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
            >
              {createFollowUp.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Follow-Up
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFollowUpCreateSheet;