// src/components/followups/LeadFollowUpCreateSheet.tsx
import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { useCreateFollowUp, useUpdateFollowUp } from "../../hooks/followup/useFollowUpMutations";
import { useUsersDropdown } from "../../hooks/users/Useusers";
import { usePermissions } from "../../context/PermissionContext";
import { useLeadFollowupStatuses } from "../../hooks/followup/useLeadFollowupStatuses";
import { DatePicker } from "antd";
import dayjs from "dayjs";

interface LeadFollowUpCreateSheetProps {
  open: boolean;
  leadId: string | null;
  leadName?: string;
  followUpData?: any | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// STATUS_OPTIONS are now fetched from the API via useLeadFollowupStatuses hook

const LeadFollowUpCreateSheet = ({
  open,
  leadId,
  leadName,
  followUpData,
  onClose,
  onSuccess,
}: LeadFollowUpCreateSheetProps) => {
  const isEditMode = !!followUpData;

  // ✅ ALL hooks must be called before any conditional return
  const { hasPermission } = usePermissions();
  const canAddFollowUp = hasPermission("lead", "view");
  const canEditFollowUp = hasPermission("lead", "view");

  const [formData, setFormData] = useState({
    followUpDate: "",
    notes: "",
    nextFollowupDate: "",
    followUpBy: "",
    status: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createFollowUp = useCreateFollowUp();
  const updateFollowUp = useUpdateFollowUp();
  const usersDropdownMutation = useUsersDropdown();
  const { data: statusOptions = [], isLoading: statusesLoading } = useLeadFollowupStatuses();

  useEffect(() => {
    if (open) usersDropdownMutation.mutate(undefined);
  }, [open]);

  const { data: employees } = usersDropdownMutation;

  const isPending = createFollowUp.isPending || updateFollowUp.isPending;

  useEffect(() => {
    if (open) {
      if (isEditMode && followUpData) {
        setFormData({
          followUpDate: followUpData.followUpDate
            ? new Date(followUpData.followUpDate).toISOString().substring(0, 10)
            : "",
          notes: followUpData.notes || "",
          nextFollowupDate: followUpData.nextFollowupDate
            ? new Date(followUpData.nextFollowupDate).toISOString().substring(0, 10)
            : "",
          followUpBy: followUpData.followUpBy || "",
          status: followUpData.status || 1,
        });
      } else {
        const today = new Date().toISOString().substring(0, 10);
        setFormData({
          followUpDate: today,
          notes: "",
          nextFollowupDate: "",
          followUpBy: "",
          status: 1,
        });
      }
      setErrors({});
    }
  }, [open, followUpData]);

  // ✅ Hard guard AFTER all hooks
  if (!open) return null;
  if (isEditMode && !canEditFollowUp) return null;
  if (!isEditMode && !canAddFollowUp) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!isEditMode) {
      if (!formData.followUpDate)
        newErrors.followUpDate = "Follow-up date is required";
    }

    if (!formData.notes.trim())
      newErrors.notes = "Notes are required";

    if (!formData.followUpBy)
      newErrors.followUpBy = "Follow-up by is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && !canEditFollowUp) return;
    if (!isEditMode && !canAddFollowUp) return;

    if (!validate()) return;

    const payload = {
      followUpDate: formData.followUpDate,
      notes: formData.notes,
      nextFollowUpDate: formData.nextFollowupDate || undefined,
      followUpBy: formData.followUpBy,
      status: formData.status,
    };

    if (isEditMode) {
      updateFollowUp.mutate(
        { followUpId: followUpData.followUpID, data: payload },
        { onSuccess: () => { onSuccess?.(); onClose(); } }
      );
    } else {
      if (!leadId) return;
      createFollowUp.mutate(
        { leadId, ...payload },
        { onSuccess: () => { onSuccess?.(); onClose(); } }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {isEditMode ? "Edit Follow-Up" : "Add Lead Follow-Up"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEditMode
                ? "Update follow-up details below."
                : leadName
                  ? `Add follow-up details for ${leadName}`
                  : "Fill in the follow-up details."}
            </p>
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

          {isEditMode && followUpData?.leadId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Lead No
              </label>
              <input
                type="text"
                value={followUpData.leadId}
                readOnly
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          )}

          {!isEditMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Follow-Up Date <span className="text-red-500">*</span>
              </label>
              <DatePicker
                className={`w-full h-10 rounded-lg ${errors.followUpDate ? "border-red-500" : "border-slate-300"}`}
                format="YYYY-MM-DD"
                placeholder="Select follow-up date"
                value={formData.followUpDate ? dayjs(formData.followUpDate) : null}
                onChange={(date, dateString) =>
                  setFormData({ ...formData, followUpDate: Array.isArray(dateString) ? dateString[0] : dateString })
                }
              />
              {errors.followUpDate && (
                <p className="text-red-500 text-xs mt-1">{errors.followUpDate}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Next Follow-Up Date
            </label>
            <DatePicker
              className="w-full h-10 border-slate-300 rounded-lg"
              format="YYYY-MM-DD"
              placeholder="Select next follow-up date"
              value={formData.nextFollowupDate ? dayjs(formData.nextFollowupDate) : null}
              onChange={(date, dateString) =>
                setFormData({ ...formData, nextFollowupDate: Array.isArray(dateString) ? dateString[0] : dateString })
              }
            />
          </div>

          {isEditMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: Number(e.target.value) })
                }
                disabled={statusesLoading}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-60"
              >
                {statusesLoading ? (
                  <option>Loading...</option>
                ) : (
                  statusOptions.map((s) => (
                    <option key={s.leadFollowupStatusID} value={s.leadFollowupStatusID}>
                      {s.statusName}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 btn-primary rounded-lg transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 size={16} className="animate-spin" />Saving...</>
              ) : (
                <><Save size={16} />{isEditMode ? "Update Follow-Up" : "Save Follow-Up"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFollowUpCreateSheet;