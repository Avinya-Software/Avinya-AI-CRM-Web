import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { useUpsertRenewal } from "../../hooks/renewal/useUpsertRenewal";
import { usePolicyDropdown } from "../../hooks/policy/usePolicyDropdown";
import { useCustomerDropdown } from "../../hooks/customer/useCustomerDropdown";
import { useRenewalStatuses } from "../../hooks/renewal/useRenewalStatuses";
import Spinner from "../common/Spinner";
import SearchableComboBox from "../common/SearchableComboBox";

interface Props {
  open: boolean;
  onClose: () => void;
  renewal?: any;
  onSuccess: () => void;
}

const RenewalUpsertSheet = ({
  open,
  onClose,
  renewal,
  onSuccess,
}: Props) => {
  /*   LOCK BODY SCROLL   */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  /*   FORM STATE   */

  const initialForm = {
    renewalId: null as string | null,
    customerId: "",
    policyId: "",
    renewalStatusId: 0,
    renewalDate: "",
    renewalPremium: 0,
    reminderDaysInput: "90,60,30,15,7,1", // 👈 USER INPUT
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFromPolicy = !!renewal?.policyId;
 
  /*   API HOOKS   */

  const { mutateAsync, isPending } = useUpsertRenewal();
  const { data: customers, isLoading: cLoading } = useCustomerDropdown();
const shouldLoadPolicies = !!form.customerId;

const { data: policies } = usePolicyDropdown(
  shouldLoadPolicies ? form.customerId : undefined
);
  const { data: statuses, isLoading: sLoading } = useRenewalStatuses();

  const loadingDropdowns = cLoading  || sLoading;
  const selectedCustomer =
  customers?.find(c => c.customerId === form.customerId);

  /*   PREFILL   */

  useEffect(() => {
  if (!open) {
    setForm(initialForm);
    setErrors({});
    return;
  }

  // Prefill ONLY when editing / coming from policy
  if (renewal && statuses?.length) {
    const mappedStatusId =
      statuses.find(
        (s: any) =>
          s.name?.toLowerCase() ===
          renewal.status?.toLowerCase()
      )?.id ?? 0;

    setForm((prev) => ({
      ...prev,
      renewalId: renewal.renewalId ?? null,
      customerId: renewal.customerId ?? "",
      policyId: renewal.policyId ?? "",
      renewalStatusId: mappedStatusId,
      renewalDate: renewal.renewalDate
        ? renewal.renewalDate.split("T")[0]
        : "",
      renewalPremium: renewal.renewalPremium ?? 0,
      reminderDaysInput: renewal.reminderDatesJson
        ? JSON.parse(renewal.reminderDatesJson).join(",")
        : "90,60,30,15,7,1",
    }));
  }
}, [open, renewal, statuses]);

  /*   VALIDATION   */

  const parseReminderDays = (): number[] | null => {
    const raw = form.reminderDaysInput;

    if (!raw.trim()) {
      setErrors((e) => ({
        ...e,
        reminderDaysInput: "Reminder days are required",
      }));
      return null;
    }

    const parts = raw.split(",").map((x) => x.trim());

    if (parts.some((x) => x === "")) {
      setErrors((e) => ({
        ...e,
        reminderDaysInput: "Empty values are not allowed",
      }));
      return null;
    }

    const numbers = parts.map(Number);

    if (numbers.some((n) => isNaN(n))) {
      setErrors((e) => ({
        ...e,
        reminderDaysInput: "Only numbers are allowed",
      }));
      return null;
    }

    if (numbers.some((n) => n <= 0)) {
      setErrors((e) => ({
        ...e,
        reminderDaysInput: "Days must be greater than 0",
      }));
      return null;
    }

    const unique = new Set(numbers);
    if (unique.size !== numbers.length) {
      setErrors((e) => ({
        ...e,
        reminderDaysInput: "Duplicate values are not allowed",
      }));
      return null;
    }

    return numbers.sort((a, b) => b - a);
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.customerId) e.customerId = "Customer is required";
    if (!form.policyId) e.policyId = "Policy is required";
    if (!form.renewalStatusId)
      e.renewalStatusId = "Status is required";
    if (!form.renewalDate)
      e.renewalDate = "Renewal date is required";

    setErrors(e);

    if (Object.keys(e).length) {
      toast.error("Please fix validation errors");
      return false;
    }

    const reminderDays = parseReminderDays();
    if (!reminderDays) {
      toast.error("Invalid reminder days");
      return false;
    }

    return true;
  };

  /*   SAVE   */

  const handleSave = async () => {
    if (!validate()) return;

    const reminderDays = parseReminderDays();
    if (!reminderDays) return;

    try {
      await mutateAsync({
        renewalId: form.renewalId ?? undefined,
        customerId: form.customerId,
        policyId: form.policyId,
        renewalStatusId: form.renewalStatusId,
        renewalDate: form.renewalDate,
        renewalPremium: form.renewalPremium,
        reminderDatesJson: JSON.stringify(reminderDays), // ✅ FINAL JSON
      });

      // toast.success("Renewal saved successfully");
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  if (!open) return null;

  /*  UI  */

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={isPending ? undefined : onClose}
      />

      <div className="fixed top-0 right-0 w-[420px] h-screen bg-white z-[70] shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            {renewal?.renewalId ? "Edit Renewal" : "Add Renewal"}
          </h2>
          <button onClick={onClose} disabled={isPending}>
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loadingDropdowns ? (
            <Spinner />
          ) : (
            <div className="space-y-4">
              <div className={isFromPolicy ? "opacity-50 pointer-events-none" : ""}>
                <SearchableComboBox
                  label="Customer"
                  required
                  items={(customers || []).map((c) => ({
                    value: c.customerId,
                    label: c.fullName,
                  }))}
                  value={form.customerId}
                  error={errors.customerId}
                  placeholder="Select customer"
                  onSelect={(item) => {
                    setForm({
                      ...form,
                      customerId: item?.value || "",
                    });
                  }}
                />
              </div>

              <Select
                label="Policy"
                required
                value={form.policyId}
                error={errors.policyId}
                options={policies || []}
                valueKey="id"
                labelKey="policyNumber"
                disabled={isFromPolicy}
                onChange={(v) => {
                  const selectedPolicy = policies?.find(
                    (p: any) => p.id === v
                  );

                  setForm({
                    ...form,
                    policyId: v,
                    renewalDate: selectedPolicy?.renewalDate
                      ? selectedPolicy.renewalDate.split("T")[0]
                      : "",
                    renewalPremium: selectedPolicy?.premiumGross ?? 0,
                  });
                }}
              />

              <Select
                label="Renewal Status"
                required
                value={form.renewalStatusId}
                error={errors.renewalStatusId}
                options={statuses || []}
                valueKey="id"
                labelKey="name"
                onChange={(v) =>
                  setForm({
                    ...form,
                    renewalStatusId: Number(v),
                  })
                }
              />

              <Input
                type="date"
                label="Renewal Date"
                required
                value={form.renewalDate}
                error={errors.renewalDate}
                onChange={(v) =>
                  setForm({ ...form, renewalDate: v })
                }
              />

              <Input
                label="Renewal Premium"
                value={form.renewalPremium}
                onChange={(v) =>
                  setForm({
                    ...form,
                    renewalPremium: Number(v.replace(/[^0-9]/g, "")),
                  })
                }
              />

              <Input
                label="Reminder Days (comma separated)"
                value={form.reminderDaysInput}
                error={errors.reminderDaysInput}
                onChange={(v) =>
                  setForm({ ...form, reminderDaysInput: v })
                }
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex gap-3">
          <button
            className="flex-1 border rounded-lg py-2"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>

          <button
            disabled={isPending || loadingDropdowns}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2
                      flex items-center justify-center gap-2"
            onClick={handleSave}
          >
            {isPending && <Spinner />}
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
};

export default RenewalUpsertSheet;

/*  HELPERS  */

const Input = ({
  label,
  required,
  value,
  error,
  type = "text",
  onChange,
}: any) => (
  <div>
    <label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      className={`input w-full ${error ? "border-red-500" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {error && (
      <p className="text-xs text-red-600 mt-1">{error}</p>
    )}
  </div>
);

const Select = ({
  label,
  required,
  options,
  value,
  onChange,
  disabled = false,
  valueKey = "id",
  labelKey = "name",
  error,
}: any) => (
  <div>
    <label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      disabled={disabled}
      className={`input w-full ${
        error ? "border-red-500" : ""
      } disabled:bg-gray-100`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select {label}</option>
      {options?.map((o: any) => (
        <option key={o[valueKey]} value={o[valueKey]}>
          {o[labelKey]}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-xs text-red-600 mt-1">{error}</p>
    )}
  </div>
);