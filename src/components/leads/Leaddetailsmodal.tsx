import { useState, useEffect } from "react";
import { DatePicker, Select as AntSelect } from "antd"
import dayjs from "dayjs";
import { X, Phone, Mail, MapPin, Building2, Plus, Loader2, Save, Calendar } from "lucide-react";
import { useLeadDetails } from "../../hooks/lead/useLeadDetails"; // adjust path
import { useCreateFollowUp } from "../../hooks/leadFollowUp/useCreateFollowUp"; // adjust path
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "../../context/PermissionContext";
import { useAuth } from "../../auth/useAuth";
import toast from "react-hot-toast";
import { useUpdateFollowUp } from "../../hooks/followup/useFollowUpMutations";
import { useLeadFollowupStatuses } from "../../hooks/followup/useLeadFollowupStatuses";

// ── Types ──────────────────────────────────────────────────────────

interface LeadDetailSheetProps {
  lead: any | null; // minimal row object, needs leadID
  onClose: () => void;
  onEditLead?: (lead: any) => void;
  onCreateQuotation?: (lead: any) => void;
}

type Tab = "details" | "followups" | "quotations";

// ── Constants ──────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  New: "bg-blue-50 text-blue-700 border-blue-200",
  Active: "bg-green-50 text-green-700 border-green-200",
  "In Progress": "bg-yellow-50 text-yellow-700 border-yellow-200",
  Pending: "bg-orange-50 text-orange-700 border-orange-200",
  Closed: "bg-red-50 text-red-700 border-red-200",
  Lost: "bg-gray-50 text-gray-600 border-gray-200",
  Contacted: "bg-purple-50 text-purple-700 border-purple-200",
  Qualified: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

const OUTCOME_COLORS: Record<string, string> = {
  positive: "bg-green-100 text-green-700",
  negative: "bg-red-100 text-red-700",
  neutral: "bg-slate-100 text-slate-600",
};

const FOLLOW_UP_TYPES = ["Phone Call", "Email", "Visit", "Meeting", "WhatsApp"];
const OUTCOMES = ["Neutral", "Positive", "Negative"];

const fmt = (dateStr?: string | null) => {
  if (!dateStr) return "—";
  return dayjs(dateStr).format("DD MMM YYYY");
};



// ── InfoCard ───────────────────────────────────────────────────────

const InfoCard = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
    <p className="text-xs text-slate-400 mb-0.5">{label}</p>
    <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
  </div>
);

// STATUS_OPTIONS are now fetched from the API via useLeadFollowupStatuses hook

// ── Add Follow-up Form ─────────────────────────────────────────────

interface AddFollowUpFormProps {
  leadID: string;
  onSuccess: () => void;
  onCancel: () => void;
  editData?: any;
}
const AddFollowUpForm = ({ leadID, onSuccess, onCancel, editData, }: AddFollowUpFormProps) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useCreateFollowUp();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateFollowUp();
  const { data: statusOptions = [], isLoading: statusesLoading } = useLeadFollowupStatuses();

  const [form, setForm] = useState({
    followUpType: "Phone Call",
    followUpDate: dayjs().format("YYYY-MM-DD"),
    notes: "",
    outcome: "Neutral",
    nextFollowupDate: "",
    followUpBy: "",
    status: 1, // default = Pending
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.notes.trim()) e.notes = "Summary is required";
    if (!form.nextFollowupDate.trim()) e.nextFollowupDate = "Next Follow-up Date is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const { userId } = useAuth();

  useEffect(() => {
    if (editData) {
      setForm({
        notes: editData.notes || "",
        status: editData.status || 1,
        nextFollowupDate: editData.nextFollowupDate
          ? dayjs(editData.nextFollowupDate).format("YYYY-MM-DDTHH:mm:ss")
          : "",
        followUpType: "",
        followUpDate: "",
        outcome: "",
        followUpBy: "",
      });
    }
  }, [editData]);

  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      notes: form.notes,
      status: form.status,
      nextFollowupDate: form.nextFollowupDate ? dayjs(form.nextFollowupDate).format("YYYY-MM-DDTHH:mm:ss") : null,
      followUpBy: userId,
    };

    if (editData) {
      updateMutate(
        {
          followUpId: editData.followUpID,
          data: payload,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lead-detail", leadID] });
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            onSuccess();
          },
        }
      );
    }
    else {
      mutate(
        {
          leadID: leadID,
          followUpDate: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
          nextFollowupDate: form.nextFollowupDate ? dayjs(form.nextFollowupDate).format("YYYY-MM-DDTHH:mm:ss") : null,
          remark: form.notes,
          notes: form.notes,
          status: form.status,
          followUpBy: userId,
        },
        {
          onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["lead-detail", leadID] });
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            onSuccess();
          },
        }
      );
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-4 mb-4 bg-white shadow-sm">

      {/* Summary */}
      <div className="mb-3">
        <label className="text-xs font-medium text-slate-500 block mb-1">
          Summary <span className="text-red-400">*</span>
        </label>
        <textarea
          className={`w-full text-sm border rounded-lg px-2.5 py-2 h-24 ${errors.notes ? "border-red-400" : "border-slate-200"
            }`}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        {errors.notes && (
          <p className="text-xs text-red-500 mt-0.5">{errors.notes}</p>
        )}
      </div>

      {/* Status */}
      <div className="mb-3">
        <label className="text-xs font-medium text-slate-500 block mb-1">
          Status
        </label>
        <AntSelect
          showSearch
          className="w-full h-10"
          value={form.status}
          disabled={statusesLoading}
          onChange={(val) =>
            setForm({ ...form, status: Number(val) })
          }
          placeholder="Select Status"
          optionFilterProp="children"
          loading={statusesLoading}
        >
          {statusOptions.map((s) => (
            <AntSelect.Option key={s.leadFollowupStatusID} value={s.leadFollowupStatusID}>
              {s.statusName}
            </AntSelect.Option>
          ))}
        </AntSelect>
      </div>

      <div className="mb-4 flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 block mb-1">
          Next Follow-up Date & Time <span className="text-red-400">*</span>
        </label>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="Select date & time"
          value={
            form.nextFollowupDate
              ? dayjs(form.nextFollowupDate)
              : null
          }
          onChange={(date) =>
            setForm({
              ...form,
              nextFollowupDate: date ? date.format("YYYY-MM-DDTHH:mm:ss") : "",
            })
          }
          disabledDate={(current) => current && current < dayjs().startOf('day')}
          className={`w-full text-sm border rounded-lg px-2.5 py-2  ${errors.notes ? "border-red-400" : "border-slate-200"
            }`}
        />
        {errors.nextFollowupDate && (
          <p className="text-xs text-red-500 mt-0.5">{errors.nextFollowupDate}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1 border border-slate-200 rounded-lg py-2 text-sm"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex-1 btn-primary rounded-lg py-2 text-sm flex items-center justify-center gap-1.5 transition"
        >
          {isPending || isUpdating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {editData ? "Updating..." : "Saving..."}
            </>
          ) : (
            <>
            <Save size={16} />
            {editData ? "Update Follow-up" : "Save Follow-up"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main Sheet ─────────────────────────────────────────────────────

const LeadDetailSheet = ({
  lead,
  onClose,
  onEditLead,
  onCreateQuotation,
}: LeadDetailSheetProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<any | null>(null);
  const { hasPermission } = usePermissions();
  const canEditLead = hasPermission("lead", "edit");
  const canAddFollowUp = hasPermission("lead", "view");
  const canAddQuotation = hasPermission("quotation", "add");

  const leadId = lead?.leadID ?? lead?.leadId ?? null;
  const { data, isLoading, isError } = useLeadDetails(leadId);

  // Reset when lead changes
  useEffect(() => {
    setActiveTab("details");
    setShowAddForm(false);
  }, [leadId]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = lead ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lead]);

  if (!lead) return null;

  const followups = data?.followups ?? [];
  const statusClass =
    STATUS_COLORS[data?.statusName ?? lead?.statusName ?? ""] ??
    "bg-slate-50 text-slate-600 border-slate-200";

  const tabs: { key: Tab; label: string }[] = [
    { key: "details", label: "Details" },
    { key: "followups", label: `Follow-ups (${data?.followupCount ?? followups.length ?? 0})` },
    // { key: "quotations", label: "Quotations (0)" },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Sheet */}
      <div className="fixed right-0 top-0 h-screen w-1/2 max-w-[800px] sm:w-full bg-white z-50 flex flex-col shadow-2xl border-l border-slate-100">

        {/* ── HEADER ── */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-6 w-44 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-slate-900 leading-snug truncate">
                    {data?.contactPerson ?? lead?.contactPerson}
                  </h2>
                  {(data?.companyName ?? lead?.companyName) && (
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                      <Building2 size={14} className="text-slate-400 shrink-0" />
                      {data?.companyName ?? lead?.companyName}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 ml-3 shrink-0">
              {(data?.statusName ?? lead?.statusName) && (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusClass}`}
                >
                  {data?.statusName ?? lead?.statusName}
                </span>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex border-b border-slate-100 px-6 bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-4 text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key
                ? "border-blue-600 text-blue-700 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-700 font-medium"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex justify-center items-center py-24">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          )}

          {isError && (
            <div className="text-center py-24 text-red-500 text-sm px-6">
              Failed to load lead details. Please try again.
            </div>
          )}

          {!isLoading && !isError && data && (
            <>
              {/* ── DETAILS TAB ── */}
              {activeTab === "details" && (
                <div className="px-6 py-5 space-y-6">

                  {/* Contact Info */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Contact
                    </p>
                    <div className="space-y-2">
                      {data.mobile && (
                        <div className="flex items-center gap-3 px-3 py-2.5 border border-slate-100 rounded-xl text-sm text-slate-700 bg-slate-50">
                          <Phone size={14} className="text-slate-400 shrink-0" />
                          {data.mobile}
                        </div>
                      )}
                      {data.email && (
                        <div className="flex items-center gap-3 px-3 py-2.5 border border-slate-100 rounded-xl text-sm text-slate-700 bg-slate-50">
                          <Mail size={14} className="text-slate-400 shrink-0" />
                          <span className="break-all">{data.email}</span>
                        </div>
                      )}
                      {data.billingAddress && (
                        <div className="flex items-start gap-3 px-3 py-2.5 border border-slate-100 rounded-xl text-sm text-slate-700 bg-slate-50">
                          <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                          {data.billingAddress}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lead Info */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Lead Info
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <InfoCard label="Source" value={data.leadSourceName} />
                      <InfoCard label="Assigned To" value={data.assignToName} />
                      <InfoCard label="Created Date" value={fmt(data.createdDate)} />
                      <InfoCard label="Next Follow-up" value={fmt(data.nextFollowupDate)} />
                      {data.clientTypeName && (
                        <InfoCard label="Customer Type" value={data.clientTypeName} />
                      )}
                      {data.gstNo && (
                        <InfoCard label="GST No" value={data.gstNo} />
                      )}
                    </div>
                    {data.createdbyName && (
                      <div className="mt-2">
                        <InfoCard label="Created By" value={data.createdbyName} />
                      </div>
                    )}
                  </div>

                  {/* Requirement */}
                  {(data.requirementDetails || data.notes) && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                        Requirement
                      </p>
                      {data.requirementDetails && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Requirement Details</p>
                          <div className="border border-slate-100 rounded-xl px-4 py-3 bg-slate-50 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {data.requirementDetails}
                          </div>
                        </div>
                      )}
                      {data.notes && (
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                          <div className="border border-blue-50 border-dashed rounded-xl px-4 py-3 bg-blue-50/30 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {data.notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── FOLLOW-UPS TAB ── */}
              {activeTab === "followups" && (
                <div className="px-6 py-5 space-y-4">
                  {/* Add button */}
                  {canAddFollowUp && !showAddForm && (
                    <button
                      onClick={() => {
                        setShowAddForm(true);
                      }}
                      className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-700 rounded-xl py-2.5 text-sm font-medium hover:bg-slate-50 transition"
                    >
                      <Plus size={15} />
                      Add Follow-up
                    </button>
                  )}

                  {/* Inline Add Form */}
                  {showAddForm && (
                    <AddFollowUpForm
                      leadID={data?.leadID ?? leadId}
                      editData={editingFollowUp}
                      onCancel={() => {
                        setShowAddForm(false);
                        setEditingFollowUp(null);
                      }}
                      onSuccess={() => {
                        setShowAddForm(false);
                        setEditingFollowUp(null);
                      }}
                    />
                  )}

                  {/* Follow-up List */}
                  {followups.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      No follow-ups yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {followups.map((fu) => {
                        const outcomeLower = (fu as any).outcome?.toLowerCase() ?? "neutral";
                        const outcomeClass =
                          OUTCOME_COLORS[outcomeLower] ?? OUTCOME_COLORS.neutral;

                        return (
                          <div
                            key={fu.followUpID}
                            className="group border border-slate-200 rounded-xl px-4 py-3 bg-white shadow-sm hover:shadow-md transition-all"
                          >
                            {/* ── TOP ROW ── */}
                            <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border">
                                  {(fu as any).followUpType ?? (fu as any).type ?? "Follow-up"}
                                </span>
                                {(fu as any).outcome && (
                                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${outcomeClass}`}>
                                    {outcomeLower}
                                  </span>
                                )}
                                {fu.statusName && !(fu as any).outcome && (
                                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                                    {fu.statusName}
                                  </span>
                                )}
                              </div>

                              {/* Edit Icon */}
                              {fu.statusName !== "Completed" && (
                                <button
                                  onClick={() => {
                                    setEditingFollowUp(fu);
                                    setShowAddForm(true);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-blue-600"
                                  title="Edit"
                                >
                                  ✎
                                </button>
                              )}
                            </div>

                            {/* Notes */}
                            <p className="text-sm text-slate-700 leading-relaxed mb-2">
                              {fu.notes || "—"}
                            </p>

                            {/* Dates */}
                            <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {fmt((fu as any).followUpDate ?? fu.createdDate)}
                              </span>

                              {fu.nextFollowupDate && (
                                <span className="flex items-center gap-1 text-blue-500 font-medium">
                                  <Calendar size={12} />
                                  Next: {fmt(fu.nextFollowupDate)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        {activeTab === "details" && (
          <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-white flex-wrap">
            {canEditLead && (
              <button
                className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-2"
                onClick={() => { onClose(); onEditLead?.(data ?? lead); }}
              >
                ✎ Edit Lead
              </button>
            )}
            {canAddQuotation && (
              <button
                className="flex-1 btn-primary rounded-xl py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2"
                onClick={() => { onClose(); onCreateQuotation?.(data ?? lead); }}
              >
                Create Quotation
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default LeadDetailSheet;