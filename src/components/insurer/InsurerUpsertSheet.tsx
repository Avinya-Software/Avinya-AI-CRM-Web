import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  upsertInsurerApi,
  getInsurerPortalPasswordApi,
} from "../../api/insurer.api";
import Spinner from "../common/Spinner";

interface Props {
  open: boolean;
  onClose: () => void;
  insurer?: any;
  onSuccess: () => void;
}

/*   REGEX   */

const regex = {
  insurerName: /^[A-Za-z ]{3,50}$/,
  shortCode: /^[A-Z0-9]{2,10}$/,
  contactDetails: /^.{5,200}$/,
  portalUrl: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/,
  portalUsername: /^[A-Za-z0-9._@-]{3,50}$/,
  portalPassword: /^.{6,50}$/,
};

/*   COMPONENT   */

const InsurerUpsertSheet = ({
  open,
  onClose,
  insurer,
  onSuccess,
}: Props) => {
  const isEdit = !!insurer;

  const initialForm = {
    insurerId: null,
    insurerName: "",
    shortCode: "",
    contactDetails: "",
    portalUrl: "",
    portalUsername: "",
    portalPassword: "",
  };

  const [form, setForm] = useState<any>(initialForm);
  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFetched, setPasswordFetched] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  /*   PREFILL   */

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setForm({
        ...insurer,
        portalPassword: "",
      });
    } else {
      setForm(initialForm);
    }

    setErrors({});
    setShowPassword(false);
    setPasswordFetched(false);
    setLoadingPassword(false);
  }, [open, insurer]);

  /*   VALIDATION   */

  const validate = () => {
    const e: any = {};

    if (!form.insurerName)
      e.insurerName = "Insurer name is required";
    else if (!regex.insurerName.test(form.insurerName))
      e.insurerName = "Only letters (3–50 characters)";

    if (!form.shortCode)
      e.shortCode = "Short code is required";
    else if (!regex.shortCode.test(form.shortCode))
      e.shortCode =
        "Uppercase letters & numbers (2–10)";

    if (!form.contactDetails)
      e.contactDetails = "Contact details are required";
    else if (
      !regex.contactDetails.test(form.contactDetails)
    )
      e.contactDetails =
        "Min 5 chars, no special symbols";

    if (!form.portalUrl)
      e.portalUrl = "Portal URL is required";
    else if (!regex.portalUrl.test(form.portalUrl))
      e.portalUrl = "Invalid URL format";

    if (!form.portalUsername)
      e.portalUsername = "Username is required";
    else if (
      !regex.portalUsername.test(form.portalUsername)
    )
      e.portalUsername = "Invalid username";

    if (!form.portalPassword)
      e.portalPassword = "Password is required";
    else if (
      !regex.portalPassword.test(form.portalPassword)
    )
      e.portalPassword = "Minimum 6 characters";

    setErrors(e);

    if (Object.keys(e).length) {
      toast.error("Please fix validation errors", {
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  /*   PASSWORD   */

  const handleTogglePassword = async () => {
    if (!isEdit) return;

    if (!passwordFetched) {
      setLoadingPassword(true);
      try {
        const res =
          await getInsurerPortalPasswordApi(
            insurer.insurerId
          );
        setForm((f: any) => ({
          ...f,
          portalPassword: res.password,
        }));
        setPasswordFetched(true);
      } finally {
        setLoadingPassword(false);
      }
    }

    setShowPassword((p) => !p);
  };

  /*   SAVE   */

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await upsertInsurerApi(form);
      toast.success("Insurer saved successfully");
      onClose();
      onSuccess();
    } catch {
      toast.error("Something went wrong");
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
        onClick={onClose}
      />

      {/* SHEET */}
      <div className="fixed top-0 right-0 h-screen w-[420px] bg-white z-[70] shadow-xl flex flex-col animate-slideInRight">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between">
          <h2 className="font-semibold">
            {isEdit ? "Edit Insurer" : "Add Insurer"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <Input
            label="Insurer Name"
            value={form.insurerName}
            error={errors.insurerName}
            onChange={(v) =>
              setForm({ ...form, insurerName: v.replace(/[^a-zA-Z ]/g, "") })
            }
          />

          <Input
            label="Short Code"
            value={form.shortCode}
            error={errors.shortCode}
            onChange={(v) =>
              setForm({ ...form, shortCode: v })
            }
          />

          <TextArea
            label="Contact Details"
            value={form.contactDetails}
            error={errors.contactDetails}
            onChange={(v) =>
              setForm({
                ...form,
                contactDetails: v,
              })
            }
          />

          <Input
            label="Portal URL"
            value={form.portalUrl}
            error={errors.portalUrl}
            onChange={(v) =>
              setForm({ ...form, portalUrl: v })
            }
          />

          <Input
            label="Portal Username"
            value={form.portalUsername}
            error={errors.portalUsername}
            onChange={(v) =>
              setForm({
                ...form,
                portalUsername: v,
              })
            }
          />

          {/* PASSWORD */}
          <div>
            <label className="text-sm font-medium">
              Portal Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`input w-full pr-10 ${
                  errors.portalPassword
                    ? "border-red-500"
                    : ""
                }`}
                value={form.portalPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    portalPassword: e.target.value,
                  })
                }
              />

              {isEdit && (
                <button
                  type="button"
                  className="absolute right-2 top-2 text-slate-500"
                  onClick={handleTogglePassword}
                >
                  {loadingPassword
                    ? "..."
                    : showPassword
                    ? <EyeOff />
                    : <Eye />}
                </button>
              )}
            </div>

            {errors.portalPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.portalPassword}
              </p>
            )}
          </div>
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
            disabled={saving}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2"
            onClick={handleSave}
          >
            <span className="flex items-center justify-center gap-2">
              {saving && <Spinner />}
              <span>{saving ? "Saving..." : "Save"}</span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default InsurerUpsertSheet;

/*   INPUT   */

const Input = ({
  label,
  value,
  onChange,
  error,
}: any) => (
  <div>
    <label className="text-sm font-medium">
      {label}
    </label>
    <input
      className={`input w-full ${
        error ? "border-red-500" : ""
      }`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {error && (
      <p className="text-xs text-red-500 mt-1">
        {error}
      </p>
    )}
  </div>
);

/*   TEXTAREA   */

const TextArea = ({
  label,
  value,
  onChange,
  error,
}: any) => (
  <div>
    <label className="text-sm font-medium">
      {label}
    </label>
    <textarea
      rows={3}
      className={`input w-full resize-none ${
        error ? "border-red-500" : ""
      }`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {error && (
      <p className="text-xs text-red-500 mt-1">
        {error}
      </p>
    )}
  </div>
);
