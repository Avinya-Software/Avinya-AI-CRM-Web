import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { useUpsertLead } from "../../hooks/lead/useUpsertLead";
import { useLeadStatuses } from "../../hooks/lead/useLeadStatuses";
import { useLeadSources } from "../../hooks/lead/useLeadSources";
import { getCustomerDropdownApi } from "../../api/customer.api";
import SearchableComboBox from "../common/SearchableComboBox";
import Spinner from "../common/Spinner";
import { toast } from "react-hot-toast";
interface Props {
  open: boolean;
  onClose: () => void;
  lead?: any;
  advisorId: string | null;
}

interface Customer {
  customerId: string;
  fullName: string;
  email: string;
  primaryMobile?: string;
  address?: string;
}

const LeadUpsertSheet = ({
  open,
  onClose,
  lead,
  advisorId,
}: Props) => {
  const { mutate, isPending } = useUpsertLead();
  const { data: statuses } = useLeadStatuses();
  const { data: sources } = useLeadSources();

  /*   LOCK BODY SCROLL   */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  /*   CUSTOMER DROPDOWN   */

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  useEffect(() => {
    getCustomerDropdownApi().then(setCustomers);
  }, []);

  /*   FORM STATE   */

  const initialForm = {
    customerId: null as string | null,
    fullName: "",
    email: "",
    mobile: "",
    address: "",
    leadStatusId: "",
    leadSourceId: "",
    notes: "",
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /*   PREFILL (EDIT MODE)   */

  useEffect(() => {
    if (!open) return;

    if (lead) {
      // 🔥 MAP VALUE → ID FOR STATUS
      const mappedStatusId =
        lead.leadStatusId ||
        statuses?.find(
          (s: any) =>
            s.name?.toLowerCase() ===
            lead.leadStatus?.toLowerCase()
        )?.id ||
        "";

      // 🔥 MAP VALUE → ID FOR SOURCE
      const mappedSourceId =
        lead.leadSourceId ||
        sources?.find(
          (s: any) =>
            s.name?.toLowerCase() ===
            lead.leadSource?.toLowerCase()
        )?.id ||
        "";

      setForm({
        customerId: lead.customerId ?? null,
        fullName: lead.fullName ?? "",
        email: lead.email ?? "",
        mobile: lead.mobile ?? "",
        address: lead.address ?? "",
        leadStatusId: mappedStatusId,
        leadSourceId: mappedSourceId,
        notes: lead.notes ?? "",
      });

      setSelectedCustomerId(lead.customerId ?? "");
    } else {
      setForm(initialForm);
      setSelectedCustomerId("");
    }

    setErrors({});
  }, [open, lead, statuses, sources]);


  useEffect(() => {
    if (!selectedCustomerId) return;
  
    if (lead) return;
  
    const customer = customers.find(
      (c) => c.customerId === selectedCustomerId
    );
  
    if (!customer) return;
  
    setForm((prev) => ({
      ...prev,
      customerId: customer.customerId,
      fullName: customer.fullName ?? "",
      email: customer.email ?? "",
      mobile: customer.primaryMobile ?? "",
      address: customer.address ?? "",
    }));
  }, [selectedCustomerId, customers, lead]);
  

  /*   CUSTOMER SELECT   */

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);

    if (!customerId) {
      setForm(initialForm);
      return;
    }

    const customer = customers.find(
      (c) => c.customerId === customerId
    );
    if (!customer) return;

    setForm((f) => ({
      ...f,
      customerId: customer.customerId,
      fullName: customer.fullName,
      email: customer.email,
      mobile: customer.primaryMobile ?? "",
      address: customer.address ?? "",
    }));
  };

  /*   VALIDATION   */

  const validate = () => {
    const e: Record<string, string> = {};
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!form.fullName.trim())
      e.fullName = "Full name is required";

    if (!form.mobile.trim())
      e.mobile = "Mobile is required";
    else if (!mobileRegex.test(form.mobile))
      e.mobile = "Invalid mobile number";

    if(!form.leadStatusId)
      e.leadStatusId = "Lead status is required";

    if (!form.leadSourceId)
      e.leadSourceId = "Lead source is required";

      setErrors(e);

    if (Object.keys(e).length) {
      toast.error("Please fix validation errors");
      return false;
    }
    
    return true;
  };

  /*  SAVE  */

  const handleSave = () => {
    if (!validate()) return;

    mutate(
      {
        leadId: lead?.leadId,
        advisorId,
        ...form,
        leadStatusId:
          form.leadStatusId ||
          statuses?.find((s: any) => s.name === "New")?.id,
      },
      { onSuccess: onClose }
    );
  };

  if (!open) return null;

  /*  == UI  == */

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 h-screen w-[420px] bg-white z-[70] shadow-2xl animate-slideInRight flex flex-col">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between">
          <h2 className="font-semibold">
            {lead ? "Edit Lead" : "Add Lead"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <label className="text-sm font-medium">
          Existing Customer (optional)
        </label>

        <SearchableComboBox
        label="customer"
          items={customers.map((c) => ({
            value: c.customerId,
            label: `${c.fullName} (${c.email})`,
          }))}
          value={selectedCustomerId}
          placeholder="Search Customer..."
          emptyText="No customer found"
          createText="Add new customer"
          onSelect={(item) => {
            setSelectedCustomerId(item?.value);
            
          }}
        />

          <Input
            label="Full Name"
            required
            value={form.fullName}
            error={errors.fullName}
            onChange={(v) =>
              setForm({ ...form, fullName: v.replace(/[^a-zA-Z ]/g, "")})
            }
          />

          <Input
            label="Email"
            value={form.email}
            onChange={(v) =>
              setForm({ ...form, email: v })
            }
          />

          <Input
            label="Mobile"
            required
            value={form.mobile}
            error={errors.mobile}
            onChange={(v) =>
              setForm({ ...form, mobile: v.replace(/[^0-9]/g, "").slice(0, 10) })
            }
          />

          <Textarea
            label="Address"
            value={form.address}
            onChange={(v) =>
              setForm({ ...form, address: v })
            }
          />

          <Select
            label="Lead Status"
            required
            value={form.leadStatusId}
            options={statuses}
            error={errors.leadStatusId}
            onChange={(v) =>
              setForm({ ...form, leadStatusId: v })
            }
          />

          <Select
            label="Lead Source"
            required
            value={form.leadSourceId}
            options={sources}
            error={errors.leadSourceId}
            onChange={(v) =>
              setForm({ ...form, leadSourceId: v })
            }
          />

          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(v) =>
              setForm({ ...form, notes: v })
            }
          />
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex gap-3">
          <button
            className="flex-1 border rounded-lg py-2"
            onClick={onClose}
          >
            Cancel
          </button>
         <button
            disabled={isPending}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2"
            onClick={handleSave}
          >
            <span className="flex items-center justify-center gap-2">
              {isPending && <Spinner/>}
              <span>{isPending ? "Saving..." : "Save"}</span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default LeadUpsertSheet;

/*   HELPERS   */

const Input = ({ label, required, value, error, onChange }: any) => (
  <div>
    <label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
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
  value,
  options,
  error,
  onChange,
}: any) => (
  <div>
    <label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      className={`input w-full ${error ? "border-red-500" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select</option>
      {options?.map((o: any) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-xs text-red-600 mt-1">{error}</p>
    )}
  </div>
);

const Textarea = ({ label, value, onChange }: any) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <textarea
      className="input w-full h-24"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
