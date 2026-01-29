import { useEffect, useState } from "react";
import { X, Eye, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { createCustomerApi } from "../../api/customer.api";
import { useKycFileActions } from "../../hooks/customer/useKycFileActions";
import Spinner from "../common/Spinner";

interface Props {
  open: boolean;
  onClose: () => void;
  customer?: any;
  leadId?: string;
  onSuccess: () => void;
}

const CustomerUpsertSheet = ({
  open,
  onClose,
  customer,
  leadId,
  onSuccess,
}: Props) => {
  /*   LOCK BODY SCROLL   */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  /*   KYC ACTIONS   */
  const [existingKycFiles, setExistingKycFiles] = useState<string[]>([]);

  const { preview, download, remove } = useKycFileActions(
    (deletedId) => {
      setExistingKycFiles((prev) =>
        prev.filter((f) => !f.startsWith(deletedId + "_"))
      );
    }
  );

  /*   FORM STATE   */

  const initialForm = {
    customerId: null as string | null,
    fullName: "",
    primaryMobile: "",
    secondaryMobile: "",
    email: "",
    address: "",
    dob: "",
    anniversary: "",
    notes: "",
    leadId: "",
  };

  const [form, setForm] = useState(initialForm);
  const [kycFiles, setKycFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  /*   PREFILL   */

  useEffect(() => {
    if (!open) return;

    if (customer) {
      setForm({
        customerId: customer.customerId ?? null,
        fullName: customer.fullName ?? "",
        primaryMobile: customer.primaryMobile ?? "",
        secondaryMobile: customer.secondaryMobile ?? "",
        email: customer.email ?? "",
        address: customer.address ?? "",
        dob: customer.dob ? customer.dob.split("T")[0] : "",
        anniversary: customer.anniversary
          ? customer.anniversary.split("T")[0]
          : "",
        notes: customer.notes ?? "",
        leadId: customer.leadId ?? "",
      });

      setExistingKycFiles(
        customer.kycFiles
          ? customer.kycFiles.split(",").filter(Boolean)
          : []
      );
    } else {
      setForm({ ...initialForm, leadId: leadId ?? "" });
      setExistingKycFiles([]);
      setKycFiles([]);
    }

    setErrors({});
  }, [open, customer, leadId]);

  /*   AUTO CLEAR INVALID ANNIVERSARY   */

  useEffect(() => {
    if (
      form.dob &&
      form.anniversary &&
      new Date(form.anniversary) <= new Date(form.dob)
    ) {
      setForm((prev) => ({ ...prev, anniversary: "" }));
    }
  }, [form.dob]);

  /*   VALIDATION   */

  const validate = () => {
    const e: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!form.fullName.trim())
      e.fullName = "Full name is required";

    if (!form.primaryMobile.trim())
      e.primaryMobile = "Mobile is required";
    else if (!mobileRegex.test(form.primaryMobile))
      e.primaryMobile = "Invalid mobile number";

    if (!form.email.trim())
      e.email = "Email is required";
    else if (!emailRegex.test(form.email))
      e.email = "Invalid email address";

    if (form.dob && form.anniversary) {
      const dob = new Date(form.dob);
      const anniversary = new Date(form.anniversary);

      if (anniversary <= dob) {
        e.anniversary =
          "Anniversary date must be after date of birth";
      }
    }

    setErrors(e);

    if (Object.keys(e).length) {
      toast.error("Please fix validation errors");
      return false;
    }

    return true;
  };

  /*   SAVE   */

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await createCustomerApi({
        ...form,
        kycFiles: kycFiles.length ? kycFiles : undefined,
      });

      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  /*  UI  */

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={saving ? undefined : onClose}
      />

      {/* SHEET */}
      <div className="fixed top-0 right-0 h-screen w-[420px] bg-white z-[70] shadow-2xl flex flex-col animate-slideInRight">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between">
          <h2 className="font-semibold">
            {customer ? "Edit Customer" : "Add Customer"}
          </h2>
          <button onClick={onClose} disabled={saving}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <Input
            label="Full Name"
            required
            value={form.fullName}
            error={errors.fullName}
            onChange={(v) => setForm({ ...form, fullName: v.replace(/[^a-zA-Z ]/g, "") })}
          />

          <Input
            label="Primary Mobile"
            required
            value={form.primaryMobile}
            error={errors.primaryMobile}
            onChange={(v) =>
              setForm({ ...form, primaryMobile: v.replace(/[^0-9]/g, "").slice(0, 10) })
            }
          />

          <Input
            label="Secondary Mobile"
            value={form.secondaryMobile}
            onChange={(v) =>
              setForm({ ...form, secondaryMobile: v.replace(/[^0-9]/g, "").slice(0, 10) })
            }
          />

          <Input
            label="Email"
            required
            value={form.email}
            error={errors.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />

          <Textarea
            label="Address"
            value={form.address}
            onChange={(v) => setForm({ ...form, address: v })}
          />

          <Input
            label="Date of Birth"
            type="date"
            value={form.dob}
            max={new Date().toISOString().split("T")[0]}
            onChange={(v) => setForm({ ...form, dob: v })}
          />

          <Input
            label="Anniversary"
            type="date"
            value={form.anniversary}
            error={errors.anniversary}
            max={new Date().toISOString().split("T")[0]}
            onChange={(v) =>
              setForm({ ...form, anniversary: v })
            }
          />

          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(v) => setForm({ ...form, notes: v })}
          />

          {/* ===== EXISTING KYC FILES ===== */}
          {customer?.customerId && existingKycFiles.length > 0 && (
            <div>
              <label className="text-sm font-medium">
                Uploaded KYC Documents
              </label>

              <div className="space-y-2 mt-2">
                {existingKycFiles.map((file) => {
                  const documentId = file.split("_")[0];

                  return (
                    <div
                      key={file}
                      className="flex justify-between items-center border rounded px-3 py-2 text-sm"
                    >
                      <span className="truncate">{file}</span>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            preview(customer.customerId, documentId)
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() =>
                            download(
                              customer.customerId,
                              documentId
                            )
                          }
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <Download size={16} />
                        </button>

                        <button
                          onClick={async () => {
                            if (
                              !confirm("Delete this document?")
                            )
                              return;
                            try {
                              await remove(
                                customer.customerId,
                                documentId
                              );
                            } catch {
                              toast.error(
                                "Failed to delete document"
                              );
                            }
                          }}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
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

          {/* ===== KYC UPLOAD ===== */}
          <div>
            <label className="text-sm font-medium">
              Add KYC Documents
            </label>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.png"
              onChange={(e) =>
                setKycFiles(
                  e.target.files
                    ? Array.from(e.target.files)
                    : []
                )
              }
              className="block mt-1 text-sm"
              disabled={saving}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex gap-3">
          <button
            className="flex-1 border rounded-lg py-2"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            disabled={saving}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 flex items-center justify-center gap-2"
            onClick={handleSave}
          >
            {saving && <Spinner />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
};

export default CustomerUpsertSheet;

/*   HELPERS   */

const Input = ({
  label,
  required,
  value,
  error,
  type = "text",
  min,
  max,
  onChange,
}: any) => (
  <div>
    <label className="text-sm font-medium">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      min={min}
      max={max}
      className={`input w-full ${error ? "border-red-500" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
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
