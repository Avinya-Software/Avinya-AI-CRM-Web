import { useEffect, useState } from "react";
import { DatePicker, Select as AntSelect } from "antd";
import dayjs from "dayjs";
import { X } from "lucide-react";

import { useUpsertLead } from "../../hooks/lead/useUpsertLead";
import { useLeadStatuses } from "../../hooks/lead/useLeadStatuses";
import { useLeadSources } from "../../hooks/lead/useLeadSources";
import { getCustomerDropdownApi } from "../../api/customer.api";
import SearchableComboBox from "../common/SearchableComboBox";
import Spinner from "../common/Spinner";
import { toast } from "react-hot-toast";
import { useUsersDropdown } from "../../hooks/users/Useusers";
import { Combobox, ComboboxOption } from "../ui/combobox";
import { useStates } from "../../hooks/state/useStates";
import { useCities } from "../../hooks/city/useCities";
import { usePermissions } from "../../context/PermissionContext";

interface Props {
  open: boolean;
  onClose: () => void;
  lead?: any;
  advisorId: string | null;
}

const CLIENT_TYPES = [
  { value: 1, label: "Company" },
  { value: 2, label: "Individual" },
];

const DashboardLeadModal = ({ open, onClose, lead, advisorId }: Props) => {
  const { mutate, isPending } = useUpsertLead();
  const leadStatusesMutation = useLeadStatuses();
  const leadSourcesMutation = useLeadSources();
  const usersDropdownMutation = useUsersDropdown();
  const statesMutation = useStates();
  const citiesMutation = useCities();
  const isEdit = !!lead;

  /* ── PERMISSIONS ── */
  const { hasPermission } = usePermissions();
  const canAdd = hasPermission("lead", "add");
  const canEdit = hasPermission("lead", "edit");
  const isReadOnly = isEdit ? !canEdit : !canAdd;

  /* BODY SCROLL LOCK */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  useEffect(() => {
    if (open) {
      leadStatusesMutation.mutate(undefined);
      leadSourcesMutation.mutate(undefined);
      usersDropdownMutation.mutate(undefined);
      statesMutation.mutate(undefined);
    }
  }, [open]);

  const statuses = leadStatusesMutation.data;
  const sources = leadSourcesMutation.data;

  /* ── CUSTOMERS ── */
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  useEffect(() => {
    getCustomerDropdownApi().then(setCustomers);
  }, []);

  const usersResponse = usersDropdownMutation.data;
  const userOptions: ComboboxOption[] = (usersResponse ?? []).map(
    (u: any) => ({ value: u.id, label: u.fullName })
  );

  /* ── STATES & CITIES ── */
  const [selectedStateId, setSelectedStateId] = useState<string>("");
  const states: any[] = statesMutation.data ?? [];
  const cities: any[] = citiesMutation.data ?? [];

  useEffect(() => {
    if (selectedStateId) citiesMutation.mutate(Number(selectedStateId));
  }, [selectedStateId]);

  /* ── FORM STATE ── */
  const initialForm = {
    customerId: null as string | null,
    fullName: "",
    email: "",
    mobile: "",
    address: "",
    assignedTo: "",
    requirementDetails: "",
    links: "",
    nextFollowupDate: "",
    leadStatusId: "",
    leadSourceId: "",
    notes: "",
    cityId: "",
    clientType: 1,
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleStateChange = (stateId: string) => {
    setSelectedStateId(stateId);
    setForm((prev) => ({ ...prev, cityId: "" }));
  };

  /* ── PREFILL ON EDIT ── */
  useEffect(() => {
    if (!open || !lead) return;

    const stateId = lead.stateID?.toString() ?? "";
    setSelectedStateId(stateId);
    const leadSourceId = lead.leadSourceID === "00000000-0000-0000-0000-000000000000" ? "" : (lead.leadSourceID ?? "");
    setForm({
      customerId: lead.clientID ?? null,
      fullName: lead.contactPerson ?? "",
      email: lead.email ?? "",
      mobile: lead.mobile ?? "",
      address: lead.billingAddress ?? "",
      assignedTo: lead.assignedTo ?? "",
      requirementDetails: lead.requirementDetails ?? "",
      links: lead.links ?? "",
      nextFollowupDate: lead.nextFollowupDate ? dayjs(lead.nextFollowupDate).format("YYYY-MM-DD HH:mm") : "",
      leadSourceId: leadSourceId,
      leadStatusId: lead.leadStatusID ?? lead.status ?? "",
      notes: lead.notes ?? "",
      cityId: lead.cityID?.toString() ?? "",
      clientType: lead.clientType ?? 1,
    });
    setSelectedCustomerId(lead.clientID ?? "");
  }, [lead, open]);

  /* ── RESET ON CLOSE ── */
  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setSelectedCustomerId("");
      setSelectedStateId("");
      setErrors({});
    }
  }, [open]);

  const onCustomerSelect = (customerId: string | null) => {
    if (customerId) {
      setSelectedCustomerId(customerId);

      const customer = customers.find(
        (c: any) => c.clientID === customerId
      );

      if (customer) {
        const stateId = customer.stateID?.toString() ?? "";

        setSelectedStateId(stateId);

        setForm((prev) => ({
          ...prev,
          customerId: customerId,
          fullName: customer.contactPerson || "",
          email: customer.email || "",
          mobile: customer.mobileNumber || "",
          address: customer.billAddress || "",
          cityId: customer.cityID?.toString() ?? "",
        }));

        if (customer.stateID) {
          setSelectedStateId(customer.stateID.toString());
        }

        setErrors((prev) => ({
          ...prev,
          fullName: "",
          email: "",
          mobile: "",
          address: "",
        }));
      }
    } else {
      setSelectedCustomerId("");
      setForm((prev) => ({
        ...prev,
        customerId: null,
        fullName: "",
        email: "",
        mobile: "",
        address: "",
        cityId: "",
      }));
      setSelectedStateId("");
    }
  };

  /* ── VALIDATION ── */
  const validate = () => {
    const e: any = {};
    const mobileRegex = /^(\+91)?[6-9]\d{9}$/;

    if (!form.fullName.trim()) e.fullName = "Full name required";
    if (!mobileRegex.test(form.mobile)) e.mobile = "Invalid mobile number";
    if (!form.leadStatusId) e.leadStatusId = "Status required";
    if (!form.leadSourceId) e.leadSourceId = "Source required";
    if (!form.nextFollowupDate) e.nextFollowupDate = "Next Followup Date required";

    setErrors(e);

    if (Object.keys(e).length) {
      toast.error("Fix validation errors");
      return false;
    }
    return true;
  };

  /* ── SAVE ── */
  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      LeadID: lead?.leadID ?? null,
      ClientID: form.customerId,
      ContactPerson: form.fullName,
      Mobile: form.mobile,
      Email: form.email,
      BillingAddress: form.address,
      StateID: selectedStateId ? Number(selectedStateId) : null,
      CityID: form.cityId ? Number(form.cityId) : null,
      RequirementDetails: form.requirementDetails,
      Links: form.links,
      Notes: form.notes,
      NextFollowupDate: form.nextFollowupDate ? dayjs(form.nextFollowupDate).format("YYYY-MM-DDTHH:mm:ss") : null,
      LeadStatusID: form.leadStatusId,
      LeadSourceID: form.leadSourceId,
      AssignedTo: form.assignedTo || advisorId,
      ClientType: form.clientType,
    };

    mutate(payload, { onSuccess: onClose });
  };

  if (!open) return null;
  if (isEdit && !canEdit) return null;
  if (!isEdit && !canAdd) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-slate-900">
            {lead ? "Edit Lead" : "Add Lead"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* left column */}
            <div className="space-y-4">
              <SearchableComboBox
                label="Customer"
                items={customers.map((c) => ({
                  value: c.clientID,
                  label: `${c.contactPerson} - ${c.email ?? ""}`,
                }))}
                value={selectedCustomerId}
                onSelect={isReadOnly
                  ? undefined
                  : (item: any) => onCustomerSelect(item?.value ?? null)
                }
                disabled={isReadOnly}
              />

              <Input
                label="Contact Person"
                required
                value={form.fullName}
                error={errors.fullName}
                onChange={(v: any) => setForm({ ...form, fullName: v })}
                disabled={isReadOnly}
              />

              <div>
                <label className="text-sm font-medium">Customer Type</label>
                <AntSelect
                  showSearch
                  className="w-full h-10 mt-1"
                  value={form.clientType}
                  onChange={(val) => setForm({ ...form, clientType: val })}
                  disabled={isReadOnly}
                  placeholder="Select Type"
                  optionFilterProp="children"
                >
                  {CLIENT_TYPES.map((t) => (
                    <AntSelect.Option key={t.value} value={t.value}>{t.label}</AntSelect.Option>
                  ))}
                </AntSelect>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Mobile"
                  required
                  value={form.mobile}
                  error={errors.mobile}
                  onChange={(v: any) => setForm({ ...form, mobile: v.replace(/[^0-9+]/g, "").slice(0, 15) })}
                  disabled={isReadOnly}
                />

                <Input
                  label="Email"
                  value={form.email}
                  onChange={(v: any) => setForm({ ...form, email: v })}
                  disabled={isReadOnly}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Employee</label>
                <Combobox
                  options={userOptions}
                  value={form.assignedTo}
                  onValueChange={(val) =>
                    !isReadOnly && setForm({ ...form, assignedTo: val })
                  }
                  placeholder="Select user..."
                  searchPlaceholder="Search users..."
                  emptyText="No users found."
                  disabled={isReadOnly}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">State</label>
                  <AntSelect
                    showSearch
                    className="w-full h-10 mt-1"
                    value={selectedStateId || undefined}
                    onChange={(val) => handleStateChange(val)}
                    disabled={isReadOnly}
                    placeholder="Select State"
                    optionFilterProp="children"
                  >
                    {(states as any[]).map((s) => (
                      <AntSelect.Option key={s.stateID} value={String(s.stateID)}>{s.stateName}</AntSelect.Option>
                    ))}
                  </AntSelect>
                </div>

                <div>
                  <label className="text-sm font-medium">City</label>
                  <AntSelect
                    showSearch
                    className="w-full h-10 mt-1"
                    value={form.cityId || undefined}
                    disabled={!selectedStateId || isReadOnly}
                    onChange={(val) => setForm({ ...form, cityId: val })}
                    placeholder={selectedStateId ? "Select City" : "Select state first"}
                    optionFilterProp="children"
                  >
                    {(cities as any[]).map((c) => (
                      <AntSelect.Option key={c.cityID} value={String(c.cityID)}>{c.cityName}</AntSelect.Option>
                    ))}
                  </AntSelect>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Lead Status <span className="text-red-500">*</span>
                  </label>
                  <AntSelect
                    showSearch
                    className="w-full h-10 mt-1"
                    value={form.leadStatusId || undefined}
                    onChange={(val) => setForm({ ...form, leadStatusId: val })}
                    disabled={isReadOnly}
                    placeholder="Select Status"
                    optionFilterProp="children"
                  >
                    {statuses?.map((o: any) => (
                      <AntSelect.Option key={o.id} value={o.id}>{o.name}</AntSelect.Option>
                    ))}
                  </AntSelect>
                  {errors.leadStatusId && <p className="text-xs text-red-600 mt-1">{errors.leadStatusId}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Lead Source <span className="text-red-500">*</span>
                  </label>
                  <AntSelect
                    showSearch
                    className="w-full h-10 mt-1"
                    value={(form.leadSourceId && form.leadSourceId !== "00000000-0000-0000-0000-000000000000") ? form.leadSourceId : undefined}
                    onChange={(val) => setForm({ ...form, leadSourceId: val })}
                    disabled={isReadOnly}
                    placeholder="Select Source"
                    optionFilterProp="children"
                  >
                    {sources?.map((o: any) => (
                      <AntSelect.Option key={o.id} value={o.id}>{o.name}</AntSelect.Option>
                    ))}
                  </AntSelect>
                  {errors.leadSourceId && <p className="text-xs text-red-600 mt-1">{errors.leadSourceId}</p>}
                </div>
              </div>
            </div>

            {/* right column */}
            <div className="space-y-4">
              <Textarea
                label="Billing Address"
                value={form.address}
                onChange={(v: any) => setForm({ ...form, address: v })}
                disabled={isReadOnly}
              />

              <Textarea
                label="Requirement Details"
                value={form.requirementDetails}
                onChange={(v: any) => setForm({ ...form, requirementDetails: v })}
                disabled={isReadOnly}
              />

              {!isEdit && (
                <Textarea
                  label="Notes"
                  value={form.notes}
                  onChange={(v: any) => setForm({ ...form, notes: v })}
                  disabled={isReadOnly}
                />
              )}

              {!isEdit && (
                <Input
                  label="Links"
                  value={form.links}
                  onChange={(v: any) => setForm({ ...form, links: v })}
                  disabled={isReadOnly}
                />
              )}

              {!isEdit && (
                <div className="flex flex-col gap-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Next Follow-up Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    placeholder="Select date & time"
                    className={`w-full h-10 rounded-lg ${errors.nextFollowupDate ? "border-red-500" : "border-slate-300"}`}
                    value={form.nextFollowupDate ? dayjs(form.nextFollowupDate) : null}
                    onChange={(date, dateString) =>
                      setForm({ ...form, nextFollowupDate: Array.isArray(dateString) ? dateString[0] : dateString })
                    }
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    disabled={isReadOnly}
                  />
                  {errors.nextFollowupDate && <p className="text-xs text-red-600 mt-1">{errors.nextFollowupDate}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-200 mt-auto flex gap-3 sticky bottom-0 bg-white z-10">
          <button
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700"
            onClick={onClose}
          >
            Cancel
          </button>

          {!isReadOnly && (
            <button
              disabled={isPending}
              className="flex-1 px-4 py-2.5 btn-primary rounded-lg transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
              onClick={handleSave}
            >
              {isPending ? <Spinner /> : isEdit ? "Update Lead" : "Save Lead"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardLeadModal;

/* ================= HELPERS ================= */

const Input = ({ label, required, value, error, onChange, type = "text", disabled }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${error ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-blue-500"} disabled:bg-slate-50 disabled:text-slate-500`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

const Select = ({ label, required, value, options, onChange, error, disabled }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <AntSelect
      showSearch
      className={`w-full h-10 ${error ? "ant-select-error" : ""}`}
      value={value || undefined}
      onChange={(val) => onChange(val)}
      disabled={disabled}
      placeholder="Select"
      optionFilterProp="children"
    >
      {Array.isArray(options) &&
        options.map((o: any) => (
          <AntSelect.Option key={o.id} value={String(o.id)}>{o.name}</AntSelect.Option>
        ))}
    </AntSelect>
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

const Textarea = ({ label, value, onChange, disabled }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
    <textarea
      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none h-24 disabled:bg-slate-50 disabled:text-slate-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  </div>
);
