import React, { useEffect, useState } from "react";
import { X, User, Phone, Mail, MapPin, Briefcase, FileText, Link, Calendar, Tag } from "lucide-react";
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
import { DatePicker, Select as AntSelect } from "antd";
import dayjs from "dayjs";

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

const LeadUpsertSheet = ({ open, onClose, lead, advisorId }: Props) => {
  const { mutate, isPending } = useUpsertLead();
  const leadStatusesMutation = useLeadStatuses();
  const leadSourcesMutation = useLeadSources();
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

  const statuses = leadStatusesMutation.data;
  const sources = leadSourcesMutation.data;

  /* ── CUSTOMERS ── */
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  useEffect(() => {
    getCustomerDropdownApi().then(setCustomers);
    leadStatusesMutation.mutate(undefined);
    leadSourcesMutation.mutate(undefined);
    usersDropdownMutation.mutate(undefined);
    statesMutation.mutate(undefined);
  }, []);

  const usersDropdownMutation = useUsersDropdown();
  const statesMutation = useStates();
  const citiesMutation = useCities();
  const [selectedStateId, setSelectedStateId] = useState<string>("");

  useEffect(() => {
    if (selectedStateId) citiesMutation.mutate(Number(selectedStateId));
  }, [selectedStateId]);

  const usersResponse = usersDropdownMutation.data;
  const userOptions: ComboboxOption[] = (usersResponse ?? []).map(
    (u: any) => ({ value: u.id, label: u.fullName })
  );

  /* ── STATES & CITIES ── */
  const states: any[] = statesMutation.data ?? [];
  const cities: any[] = citiesMutation.data ?? [];



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
    companyName: "",
    gstNo: "",
    otherSources: "",
  };

  // Auto-select 'New' status for new leads once statuses load
  useEffect(() => {
    if (!isEdit && open && statuses && statuses.length > 0 && !form.leadStatusId) {
      const newStatus = statuses.find((s: any) => s.name.toLowerCase() === "new");
      if (newStatus) {
        setForm((prev) => ({ ...prev, leadStatusId: String(newStatus.id) }));
      } else {
        setForm((prev) => ({ ...prev, leadStatusId: String(statuses[0].id) }));
      }
    }
  }, [statuses, open, isEdit]);

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
      companyName: lead.companyName ?? "",
      gstNo: lead.gstNo ?? "",
      otherSources: lead.otherSources ?? "",
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
          companyName: customer.companyName || "",
          fullName: customer.contactPerson || "",
          email: customer.email || "",
          mobile: customer.mobileNumber || "",
          gstNo: customer.gstNo || "",
          address: customer.billAddress || "",
          cityId: customer.cityID?.toString() ?? "",
          StateID: customer.stateID?.toString() ?? "",

        }));

        // load cities automatically
        if (customer.stateID) {
          setSelectedStateId(customer.stateID.toString());
        }

        // clear validation errors
        setErrors((prev) => ({
          ...prev,
          fullName: "",
          email: "",
          mobile: "",
          address: "",
        }));
      }
    } else {
      // reset when cleared
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
    if (form.mobile && !mobileRegex.test(form.mobile)) e.mobile = "Invalid mobile number";
    if (!form.leadStatusId) e.leadStatusId = "Status required";
    if (!form.requirementDetails.trim()) e.requirementDetails = "Requirement details required";
    if (!isEdit && !form.nextFollowupDate) e.nextFollowupDate = "Next follow-up date required";

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
      Date: isEdit ? (lead.date || dayjs().format("YYYY-MM-DDTHH:mm:ss")) : dayjs().format("YYYY-MM-DDTHH:mm:ss"),
      NextFollowupDate: form.nextFollowupDate ? dayjs(form.nextFollowupDate).format("YYYY-MM-DDTHH:mm:ss") : null,
      LeadStatusID: form.leadStatusId,
      LeadSourceID: form.leadSourceId || "00000000-0000-0000-0000-000000000000",
      OtherSources: form.otherSources || null,
      AssignedTo: form.assignedTo || advisorId,
      ClientType: form.clientType,
      CompanyName: form.companyName,
      GSTNo: form.gstNo,
    };

    mutate(payload, { onSuccess: onClose });
  };

  // Hard guard — don't render if no permission
  if (!open) return null;
  if (isEdit && !canEdit) return null;
  if (!isEdit && !canAdd) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />

      <div className="fixed right-0 top-0 h-screen w-full max-w-[720px] bg-white z-50 shadow-2xl flex flex-col">

        {/* ── HEADER ── */}
        <div className="px-6 py-4 border-b bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--btn-primary)]">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {lead ? "Edit Lead" : "Add New Lead"}
              </h2>
              <p className="text-xs text-slate-400">
                {lead ? "Update lead information" : "Fill in the details to create a lead"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── SECTION: Client Info ── */}
          <Section icon={<User className="w-3.5 h-3.5" />} title="Client Information" cols={3}>
            {/* Customer — full width */}
            <div className="col-span-3">
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
            </div>

            <div className="col-span-1 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Customer Type</label>
              <AntSelect
                showSearch
                className="w-full h-10"
                value={form.clientType}
                onChange={(val) => setForm({ ...form, clientType: val })}
                disabled={isReadOnly}
                optionFilterProp="children"
              >
                {CLIENT_TYPES.map((t) => (
                  <AntSelect.Option key={t.value} value={t.value}>{t.label}</AntSelect.Option>
                ))}
              </AntSelect>
            </div>

            <Input
              label="Contact Person"
              required
              value={form.fullName}
              error={errors.fullName}
              onChange={(v: any) => setForm({ ...form, fullName: v })}
              disabled={isReadOnly}
            />

            <Input
              label="Mobile"
              value={form.mobile}
              error={errors.mobile}
              onChange={(v: any) => setForm({ ...form, mobile: v.replace(/[^0-9+]/g, "").slice(0, 15) })}
              disabled={isReadOnly}
            />

            <Input
              label="Email"
              value={form.email}
              error={errors.email}
              onChange={(v: any) => setForm({ ...form, email: v })}
              disabled={isReadOnly}
            />

            {form.clientType === 1 && (
              <>
                <Input
                  label="Company Name"
                  required
                  value={form.companyName}
                  onChange={(v: any) => setForm({ ...form, companyName: v })}
                  disabled={isReadOnly}
                />
                <Input
                  label="GST No"
                  value={form.gstNo}
                  onChange={(v: any) => setForm({ ...form, gstNo: v })}
                  disabled={isReadOnly}
                />
              </>
            )}
          </Section>

          {/* ── SECTION: Lead Details ── */}
          <Section icon={<Briefcase className="w-3.5 h-3.5" />} title="Lead Details">
            {/* Lead Status | Lead Source */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Lead Status <span className="text-red-500">*</span>
              </label>
              <AntSelect
                showSearch
                className={`w-full h-10 ${errors.leadStatusId ? "ant-select-error" : ""}`}
                value={form.leadStatusId || undefined}
                onChange={(val) => setForm({ ...form, leadStatusId: val })}
                disabled={isReadOnly || !isEdit}
                placeholder="Select Status"
                optionFilterProp="children"
              >
                {Array.isArray(statuses) && statuses.map((s: any) => (
                  <AntSelect.Option key={s.id} value={String(s.id)}>{s.name}</AntSelect.Option>
                ))}
              </AntSelect>
              {errors.leadStatusId && <p className="text-xs text-red-500 mt-0.5">{errors.leadStatusId}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Lead Source</label>
              <AntSelect
                showSearch
                className="w-full h-10"
                value={(form.leadSourceId && form.leadSourceId !== "00000000-0000-0000-0000-000000000000") ? form.leadSourceId : undefined}
                onChange={(val) => setForm({ ...form, leadSourceId: val })}
                disabled={isReadOnly}
                placeholder="Select Source"
                optionFilterProp="children"
              >
                {Array.isArray(sources) && sources.map((s: any) => (
                  <AntSelect.Option key={s.id} value={String(s.id)}>{s.name}</AntSelect.Option>
                ))}
              </AntSelect>
            </div>

            {/* Conditionally show Other Sources text area */}
            {Array.isArray(sources) &&
              sources.find(s => String(s.id) === form.leadSourceId)?.name?.toLowerCase() === "other sources" && (
                <div className="col-span-2">
                  <Textarea
                    label="Other Source Details"
                    required
                    value={form.otherSources}
                    onChange={(v: any) => setForm({ ...form, otherSources: v })}
                    disabled={isReadOnly}
                    placeholder="Please specify the source details..."
                  />
                </div>
              )}

            {/* Assigned To — full width */}
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1 block">Assigned To</label>
              <AntSelect
                showSearch
                className="w-full h-10"
                value={form.assignedTo || undefined}
                onChange={(val) => setForm({ ...form, assignedTo: val })}
                disabled={isReadOnly}
                placeholder="Select user..."
                optionFilterProp="children"
              >
                {userOptions.map((opt) => (
                  <AntSelect.Option key={opt.value} value={opt.value}>{opt.label}</AntSelect.Option>
                ))}
              </AntSelect>
            </div>

            {/* Requirement Details — full width, mandatory */}
            <div className="col-span-2">
              <Textarea
                label="Requirement Details"
                required
                value={form.requirementDetails}
                error={errors.requirementDetails}
                onChange={(v: any) => setForm({ ...form, requirementDetails: v })}
                disabled={isReadOnly}
              />
            </div>
          </Section>

          {/* ── SECTION: Follow-up & Notes (new leads only) — above Location ── */}
          <Section icon={<Calendar className="w-3.5 h-3.5" />} title="Follow-up & Notes">
            {/* Links | Next Follow-up Date */}
            <Input
              label="Links"
              value={form.links}
              onChange={(v: any) => setForm({ ...form, links: v })}
              disabled={isReadOnly}
            />
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Next Follow-up Date {!isEdit && <span className="text-red-500">*</span>}
              </label>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                className={`input w-full rounded-lg border-slate-200 ${errors.nextFollowupDate ? "border-red-400" : ""}`}
                placeholder="Select date & time"
                value={form.nextFollowupDate ? dayjs(form.nextFollowupDate) : null}
                onChange={(date, dateString) =>
                  setForm({ ...form, nextFollowupDate: Array.isArray(dateString) ? dateString[0] : dateString })
                }
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                disabled={isReadOnly}
              />
              {errors.nextFollowupDate && <p className="text-xs text-red-500 mt-0.5">{errors.nextFollowupDate}</p>}
            </div>
            {/* Notes — full width */}
            <div className="col-span-2">
              <Textarea
                label="Notes"
                value={form.notes}
                onChange={(v: any) => setForm({ ...form, notes: v })}
                disabled={isReadOnly}
              />
            </div>
          </Section>


          {/* ── SECTION: Location ── */}
          <Section icon={<MapPin className="w-3.5 h-3.5" />} title="Location">
            {/* State | City */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">State</label>
              <AntSelect
                showSearch
                className="w-full h-10"
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
              <label className="text-xs font-semibold text-slate-600 mb-1 block">City</label>
              <AntSelect
                showSearch
                className="w-full h-10"
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

            {/* Billing Address — full width */}
            <div className="col-span-2">
              <Textarea
                label="Billing Address"
                value={form.address}
                onChange={(v: any) => setForm({ ...form, address: v })}
                disabled={isReadOnly}
              />
            </div>
          </Section>
        </div>

        {/* ── FOOTER ── */}
        <div className="px-6 py-4 border-t bg-slate-50 flex gap-3 shrink-0">
          <button
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          {!isReadOnly && (
            <button
              disabled={isPending}
              className="flex-1 btn-primary px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              onClick={handleSave}
            >
              {isPending ? <Spinner /> : isEdit ? "Update Lead" : "Save Lead"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default LeadUpsertSheet;

/* ================= HELPERS ================= */

const Section = ({ icon, title, children, cols = 2 }: { icon: React.ReactNode; title: string; children: React.ReactNode; cols?: number }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[var(--btn-primary)]">{icon}</span>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
    <div className={`grid grid-cols-1 md:grid-cols-${cols === 3 ? '3' : '2'} gap-x-4 gap-y-3`}>
      {children}
    </div>
  </div>
);

const Input = ({ label, required, value, error, onChange, type = "text", disabled }: any) => (
  <div>
    <label className="text-xs font-semibold text-slate-600 mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      className={`input w-full ${error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : ""} disabled:bg-slate-50 disabled:text-slate-500`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);



const Textarea = ({ label, required, value, error, onChange, disabled }: any) => (
  <div>
    <label className="text-xs font-semibold text-slate-600 mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      className={`input w-full h-20 resize-none disabled:bg-slate-50 disabled:text-slate-500 ${error ? "border-red-400 focus:ring-red-500 focus:border-red-500" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);