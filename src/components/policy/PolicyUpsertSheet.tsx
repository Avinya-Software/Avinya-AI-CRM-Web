import { useEffect, useState } from "react";
import { X, Eye, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { useUpsertPolicy } from "../../hooks/policy/useUpsertPolicy";
import { usePolicyTypesDropdown } from "../../hooks/policy/usePolicyTypesDropdown";
import { usePolicyStatusesDropdown } from "../../hooks/policy/usePolicyStatusesDropdown";
import { useCustomerDropdown } from "../../hooks/customer/useCustomerDropdown";
import { useInsurerDropdown } from "../../hooks/insurer/useInsurerDropdown";
import { useProductDropdown } from "../../hooks/product/useProductDropdown";
import { usePolicyDocumentActions } from "../../hooks/policy/usePolicyDocumentActions";
import SearchableComboBox from "../common/SearchableComboBox";

import Spinner from "../common/Spinner";

interface Props {
  open: boolean;
  onClose: () => void;
  policy?: any;
  customerId?: string;
  onSuccess: () => void;
}

const PolicyUpsertSheet = ({
  open,
  onClose,
  policy,
  customerId,
  onSuccess,
}: Props) => {
  /*   LOCK BODY SCROLL   */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  /*   POLICY DOCUMENT ACTIONS   */
  const [existingDocuments, setExistingDocuments] = useState<string[]>([]);
  const { preview, download, remove } = usePolicyDocumentActions(
    (deletedId) => {
      setExistingDocuments((prev) =>
        prev.filter((f) => !f.startsWith(deletedId + "_"))
      );
    }
  );

  /*   FORM STATE   */

  const initialForm = {
    policyId: null as string | null,
    customerId: "",
    insurerId: "",
    productId: "",
    policyTypeId: 0,
    policyStatusId: 0,
    registrationNo: "",
    startDate: "",
    endDate: "",
    premiumNet: 0,
    premiumGross: 0,
    paymentMode: "",
    paymentDueDate: "",
    renewalDate: "",
    brokerCode: "",
    policyCode: "",
    paymentDone: false,
  };

  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /*   API HOOKS   */

  const { mutateAsync, isPending } = useUpsertPolicy();

  const { data: customers, isLoading: cLoading } = useCustomerDropdown();
  const { data: insurers, isLoading: iLoading } = useInsurerDropdown();
  const { data: products, isLoading: pLoading } = useProductDropdown(
    form.insurerId || undefined
  );
  const { data: policyTypes, isLoading: tLoading } = usePolicyTypesDropdown();
  const { data: policyStatuses, isLoading: sLoading } =
    usePolicyStatusesDropdown();

  const loadingDropdowns = cLoading || iLoading || pLoading || tLoading || sLoading;
  const isLoading = isPending;
  const today = new Date().toISOString().split("T")[0];


  /*   PREFILL   */

  useEffect(() => {
    if (!open) return;

    if (policy) {
      setForm({
        policyId: policy.policyId ?? null,
        customerId: policy.customerId ?? "",
        insurerId: policy.insurerId ?? "",
        productId: policy.productId ?? "",
        policyTypeId: policy.policyTypeId ?? 0,
        policyStatusId: policy.policyStatusId ?? 0,
        registrationNo: policy.registrationNo ?? "",
        startDate: policy.startDate ? policy.startDate.split("T")[0] : "",
        endDate: policy.endDate ? policy.endDate.split("T")[0] : "",
        premiumNet: policy.premiumNet ?? 0,
        premiumGross: policy.premiumGross ?? 0,
        paymentMode: policy.paymentMode ?? "",
        paymentDueDate: policy.paymentDueDate
          ? policy.paymentDueDate.split("T")[0]
          : "",
        renewalDate: policy.renewalDate
          ? policy.renewalDate.split("T")[0]
          : "",
        brokerCode: policy.brokerCode ?? "",
        policyCode: policy.policyCode ?? "",
        paymentDone: policy.paymentDone ?? false,
      });

      setExistingDocuments(
        policy.policyDocumentRef
          ? policy.policyDocumentRef.split(",").filter(Boolean)
          : []
      );
    } else {
      setForm({
        ...initialForm,
        customerId: customerId || "",
      });
      setExistingDocuments([]);
      setFiles([]);
    }

    setErrors({});
  }, [open, policy, customerId]);

  /*   RESET PRODUCT ON INSURER CHANGE   */

  // useEffect(() => {
  //   if (form.insurerId) {
  //     setForm((prev) => ({
  //       ...prev,
  //       productId: "",
  //     }));
  //   }
  // }, [form.insurerId]);

  /*   VALIDATION   */

  const validate = () => {
    const e: Record<string, string> = {};

    // Required field validation
    if (!form.customerId) e.customerId = "Customer is required";
    if (!form.insurerId) e.insurerId = "Insurer is required";
    if (!form.productId) e.productId = "Product is required";
    if (!form.policyTypeId) e.policyTypeId = "Policy type is required";
    if (!form.policyStatusId) e.policyStatusId = "Policy status is required";
    if (!form.registrationNo.trim())
      e.registrationNo = "Registration no is required";
    if (!form.startDate) e.startDate = "Start date is required";
    if (!form.endDate) e.endDate = "End date is required";

    if (form.startDate && form.endDate) {
      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);

      if (endDate < startDate) {
        e.endDate = "End date cannot be before start date";
      }
    }

    if (form.startDate && form.paymentDueDate) {
      const startDate = new Date(form.startDate);
      const paymentDueDate = new Date(form.paymentDueDate);

      if (paymentDueDate < startDate) {
        e.paymentDueDate = "Payment due date cannot be before start date";
      }
    }

    if (form.endDate && form.renewalDate) {
      const endDate = new Date(form.endDate);
      const renewalDate = new Date(form.renewalDate);

      if (renewalDate < endDate) {
        e.renewalDate = "Renewal date cannot be before end date";
      }
    }

    setErrors(e);

    if (Object.keys(e).length) {
      toast.error("Please fix validation errors");
      return false;
    }

    return true;
  };

  /*   SAVE  */

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== "") {
          formData.append(k, String(v));
        }
      });

      files.forEach((f) => formData.append("PolicyDocuments", f));

      await mutateAsync(formData);
      // toast.success("Policy saved successfully");
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (!open) return null;

  /*  UI  */

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={isLoading ? undefined : onClose}
      />

      {/* SHEET */}
      <div className="fixed top-0 right-0 w-[420px] h-screen bg-white z-[70] shadow-2xl flex flex-col animate-slideInRight">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            {policy ? "Edit Policy" : "Add Policy"}
          </h2>
          <button onClick={onClose} disabled={isLoading}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loadingDropdowns ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              <SearchableComboBox
                label="Customer"
                required
                items={(customers || []).map((c) => ({
                  value: c.customerId,
                  label: c.fullName,
                }))}
                value={form.customerId}
                error={errors.customerId}
                disabled={!!customerId}
                placeholder="Select customer"
                onSelect={(item) =>
                  setForm({
                    ...form,
                    customerId: item?.value || "",
                  })
                }
              />

              <SearchableComboBox
                label="Insurer"
                required
                items={(insurers || []).map((i) => ({
                  value: i.insurerId,
                  label: i.insurerName,
                }))}
                value={form.insurerId}
                error={errors.insurerId}
                placeholder="Select insurer"
                onSelect={(item) =>
                  setForm({
                    ...form,
                    insurerId: item?.value || "",
                    productId: "", // reset product on insurer change
                  })
                }
              />

              <SearchableComboBox
                label="Product"
                required
                items={(products || []).map((p) => ({
                  value: p.productId,
                  label: p.productName,
                }))}
                value={form.productId}
                error={errors.productId}
                placeholder={
                  form.insurerId ? "Select product" : "Select insurer first"
                }
                onSelect={(item) =>
                  setForm({
                    ...form,
                    productId: item?.value || "",
                  })
                }
              />

              <Select
                label="Policy Type"
                required
                value={form.policyTypeId}
                error={errors.policyTypeId}
                options={policyTypes}
                onChange={(v) =>
                  setForm({
                    ...form,
                    policyTypeId: Number(v),
                  })
                }
              />

              <Select
                label="Policy Status"
                required
                value={form.policyStatusId}
                error={errors.policyStatusId}
                options={policyStatuses}
                onChange={(v) =>
                  setForm({
                    ...form,
                    policyStatusId: Number(v),
                  })
                }
              />

              <Input
                label="Registration No"
                required
                value={form.registrationNo}
                error={errors.registrationNo}
                onChange={(v) =>
                  setForm({
                    ...form,
                    registrationNo: v,
                  })
                }
              />

              <Input
                type="date"
                label="Start Date"
                required
                value={form.startDate}
                error={errors.startDate}
                max={today}
                onChange={(v) => setForm({ ...form, startDate: v, endDate : "",})}
              />

              <Input
                type="date"
                label="End Date"
                required
                value={form.endDate}
                error={errors.endDate}
                min={form.startDate}
                disabled={!form.startDate} 
                onChange={(v) => setForm({ ...form, endDate: v })}
              />

              <Input
                label="Premium Net"
                value={form.premiumNet}
                onChange={(v) =>
                  setForm({
                    ...form,
                    premiumNet: Number(v.replace(/[^0-9]/g, "")),
                  })
                }
              />

              <Input
                label="Premium Gross"
                value={form.premiumGross}
                onChange={(v) =>
                  setForm({
                    ...form,
                    premiumGross: Number(v.replace(/[^0-9]/g, "")),
                  })
                }
              />

              <Input
                label="Payment Mode"
                value={form.paymentMode}
                onChange={(v) => setForm({ ...form, paymentMode: v })}
              />

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={form.paymentDone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentDone: e.target.checked,
                      paymentDueDate: e.target.checked ? "" : form.paymentDueDate, // ✅ clear
                    })
                  }
                  className="h-4 w-4"
                />
                <label className="text-sm">
                  Payment Completed
                </label>
              </div>


             {!form.paymentDone && (
              <Input
                type="date"
                label="Payment Due Date"
                value={form.paymentDueDate}
                error={errors.paymentDueDate}
                min={form.startDate}
                onChange={(v) =>
                  setForm({ ...form, paymentDueDate: v })
                }
              />
            )}

              <Input
                type="date"
                label="Renewal Date"
                value={form.renewalDate}
                error={errors.renewalDate}
                min={form.endDate}
                onChange={(v) => setForm({ ...form, renewalDate: v })}
              />

              <Input
                label="Broker Code"
                value={form.brokerCode}
                onChange={(v) => setForm({ ...form, brokerCode: v.replace(/[^0-9]/g, "") })}
              />

              <Input
                label="Policy Code"
                value={form.policyCode}
                onChange={(v) => setForm({ ...form, policyCode: v.replace(/[^0-9]/g, "") })}
              />

              {/*  EXISTING POLICY DOCUMENTS  */}
              {policy?.policyId && existingDocuments.length > 0 && (
                <div>
                  <label className="text-sm font-medium">
                    Uploaded Policy Documents
                  </label>

                  <div className="space-y-2 mt-2">
                    {existingDocuments.map((file) => {
                      const documentId = file.split("_")[0];

                      return (
                        <div
                          key={file}
                          className="flex justify-between items-center border rounded px-3 py-2 text-sm"
                        >
                          <span className="truncate flex-1">{file}</span>

                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={() => preview(policy.policyId, documentId)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Preview"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => download(policy.policyId, documentId)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>

                            <button
                              onClick={async () => {
                                if (!confirm("Delete this document?")) return;
                                try {
                                  await remove(policy.policyId, documentId);
                                } catch {
                                  toast.error("Failed to delete document");
                                }
                              }}
                              className="p-1 hover:bg-red-100 text-red-600 rounded"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* POLICY DOCUMENT UPLOAD  */}
              <div>
                <label className="text-sm font-medium">
                  Add Policy Documents
                </label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  disabled={isLoading}
                  onChange={(e) =>
                    setFiles(e.target.files ? Array.from(e.target.files) : [])
                  }
                  className="block mt-1 text-sm"
                />
                {files.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    {files.length} file(s) selected
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex gap-3">
          <button
            className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            disabled={isLoading || loadingDropdowns}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
          >
            {isLoading && <Spinner />}
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
};

export default PolicyUpsertSheet;

/*   HELPERS   */

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
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
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
      } disabled:bg-gray-100 disabled:cursor-not-allowed`}
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
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);