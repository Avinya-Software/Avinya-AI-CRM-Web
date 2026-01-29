import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { useUpsertProduct } from "../../hooks/product/useUpsertProduct";
import { useProductCategoryDropdown } from "../../hooks/product/useProductCategoryDropdown";
import { useInsurerDropdown } from "../../hooks/insurer/useInsurerDropdown";
import Spinner from "../common/Spinner";
import SearchableComboBox from "../common/SearchableComboBox";
interface Props {
  open: boolean;
  onClose: () => void;
  product?: any;
  insurerId?: string;
  onSuccess: () => void;
}

/*   VALIDATION RULES   */

const regex = {
  productName: /^[A-Za-z0-9\s]{3,50}$/,
  productCode: /^[A-Z0-9_-]{2,20}$/,
  commissionRules: /^[A-Za-z0-9\s,.\-\/]{3,500}$/,
};

const ProductUpsertSheet = ({
  open,
  onClose,
  product,
  insurerId,
  onSuccess,
}: Props) => {
  /*   API   */
  const { mutateAsync, isPending } = useUpsertProduct();
  const { data: categories, isLoading: catLoading } =
    useProductCategoryDropdown();
  const { data: insurers, isLoading: insurerLoading } =
    useInsurerDropdown();
  const isLoading = catLoading || insurerLoading || isPending;
  const loadingDropdowns = catLoading || insurerLoading;

  /*   FORM STATE   */

  const initialForm = {
    productId: null as string | null,
    insurerId: "",
    productCategoryId: 0,
    productName: "",
    productCode: "",
    defaultReminderDays: 0,
    commissionRules: "",
    isActive: true,
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<any>({});

  /*   PREFILL   */

  useEffect(() => {
    if (!open) return;

    if (product && categories) {
      const matchedCategory = categories.find(
        (c) => c.name === product.productCategory
      );

      setForm({
        productId: product.productId ?? null,
        insurerId: product.insurerId ?? "",
        productCategoryId: matchedCategory?.id ?? 0,
        productName: product.productName ?? "",
        productCode: product.productCode ?? "",
        defaultReminderDays: product.defaultReminderDays ?? 0,
        commissionRules: product.commissionRules ?? "",
        isActive: product.isActive ?? true,
      });
    } else {
      setForm({
        ...initialForm,
        insurerId: insurerId || "",
      });
    }

    setErrors({});
  }, [open, product, categories, insurerId]);

  /*   VALIDATION   */

  const validate = () => {
    const e: any = {};

    if (!form.insurerId)
      e.insurerId = "Insurer is required";

    if (!form.productCategoryId)
      e.productCategoryId = "Category is required";

    if (!form.productName)
      e.productName = "Product name is required";
    else if (!regex.productName.test(form.productName))
      e.productName = "3–50 letters/numbers only";

    if (!form.productCode)
      e.productCode = "Product code is required";
    else if (!regex.productCode.test(form.productCode))
      e.productCode =
        "Uppercase letters, numbers, _ or -";

    if (
      form.defaultReminderDays === null ||
      form.defaultReminderDays < 0
    )
      e.defaultReminderDays = "Must be 0 or greater";

    if (!form.commissionRules)
      e.commissionRules = "Commission rules required";
    else if (!regex.commissionRules.test(form.commissionRules))
      e.commissionRules =
        "Min 3 characters, no special symbols";

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

    await mutateAsync(form);
    toast.success("Product saved successfully");
    onClose();
    onSuccess();
  };

  if (!open) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={isLoading ? undefined : onClose}
      />

      {/* SHEET */}
      <div className="fixed top-0 right-0 h-screen w-[420px] bg-white z-[70] shadow-2xl flex flex-col animate-slideInRight">
        {/*   HEADER   */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} disabled={isLoading}>
            <X />
          </button>
        </div>

        {/*   BODY   */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loadingDropdowns ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-4">
              <div className={insurerId ? "opacity-50 pointer-events-none" : ""}>
                <SearchableComboBox
                  label="Insurer"
                  items={insurers.map((i) => ({
                    value: i.insurerId,
                    label: i.insurerName,
                  }))}
                  value={form.insurerId}
                  placeholder="Select insurer"
                  onSelect={(item) =>
                    setForm({
                      ...form,
                      insurerId: item?.value || "",
                    })
                  }
                />
              </div>

              {errors.insurerId && (
                <p className="text-sm text-red-500 mt-1">{errors.insurerId}</p>
              )}

              <Select
                label="Product Category"
                value={form.productCategoryId}
                error={errors.productCategoryId}
                onChange={(v) =>
                  setForm({
                    ...form,
                    productCategoryId: Number(v),
                  })
                }
                options={categories}
                valueKey="id"
                labelKey="name"
              />

              <Input
                label="Product Name"
                value={form.productName}
                error={errors.productName}
                onChange={(v) =>
                  setForm({
                    ...form,
                    productName: v,
                  })
                }
              />

              <Input
                label="Product Code"
                value={form.productCode}
                error={errors.productCode}
                onChange={(v) =>
                  setForm({
                    ...form,
                    productCode: v,
                  })
                }
              />

              <Input
                label="Default Reminder Days"
                value={form.defaultReminderDays}
                error={errors.defaultReminderDays}
                onChange={(v) =>
                  setForm({
                    ...form,
                    defaultReminderDays: Number(v.replace(/[^0-9]/g, "")),
                  })
                }
              />

              <Textarea
                label="Commission Rules"
                value={form.commissionRules}
                error={errors.commissionRules}
                onChange={(v) =>
                  setForm({
                    ...form,
                    commissionRules: v,
                  })
                }
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isActive: e.target.checked,
                    })
                  }
                />
                Active
              </label>
            </div>
          )}
        </div>

        {/*   FOOTER   */}
        <div className="px-6 py-4 border-t flex gap-3">
          <button
            className="flex-1 border rounded-lg py-2"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 flex items-center justify-center gap-2"
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

export default ProductUpsertSheet;

/*   HELPERS   */

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  error,
}: any) => (
  <div>
    <label className="text-sm font-medium">
      {label}
    </label>
    <input
      type={type}
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

const Textarea = ({
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
      className={`input w-full h-24 resize-none ${
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

const Select = ({
  label,
  value,
  onChange,
  options,
  valueKey,
  labelKey,
  error,
  disabled = false,
}: any) => (
  <div>
    <label className="text-sm font-medium">
      {label}
    </label>
    <select
      disabled={disabled}
      className={`input w-full ${
        error ? "border-red-500" : ""
      } disabled:bg-gray-100`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Select</option>
      {options?.map((o: any) => (
        <option key={o[valueKey]} value={o[valueKey]}>
          {o[labelKey]}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-xs text-red-500 mt-1">
        {error}
      </p>
    )}
  </div>
);
