// src/components/product/ProductUpsertSheet.tsx
import { useEffect, useState } from "react";
import { Select as AntSelect } from "antd";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { useUpsertProduct } from "../../hooks/product/useUpsertProduct";
import Spinner from "../common/Spinner";
import type { Product } from "../../interfaces/product.interface";
import { useUnitTypeDropdown } from "../../hooks/product/useUnitTypeDropdown";
import { usePermissions } from "../../context/PermissionContext"; // ✅ ADDED
import { useTaxCategories } from "../../hooks/taxCategory/taxCategory";

interface Props {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: (newProduct?: any) => void;
}

const ProductUpsertSheet = ({ open, onClose, product, onSuccess }: Props) => {
  const { mutateAsync, isPending } = useUpsertProduct();
  const unitTypeDropdownMutation = useUnitTypeDropdown();
  const taxCategoriesMutation = useTaxCategories();

  useEffect(() => {
    if (open) {
      unitTypeDropdownMutation.mutate(undefined);
      taxCategoriesMutation.mutate(undefined);
    }
  }, [open]);

  const { data: unitTypes, isPending: unitLoading } = unitTypeDropdownMutation;
  const { data: taxCategoriesData, isPending: taxLoading } = taxCategoriesMutation;
  const taxCategories = taxCategoriesData ?? [];
  // ✅ permissions
  const { hasPermission } = usePermissions();
  const isEdit = !!product;

  const canCreate = hasPermission("product", "add");
  const canUpdate = hasPermission("product", "edit");

  const hasAccess = isEdit ? canUpdate : canCreate;

  const initialForm = {
    productID: null as string | null,
    productName: "",
    category: "",
    unitType: "",
    defaultRate: "" as number | string,
    purchasePrice: "" as number | string,
    hsnCode: "",
    taxCategoryID: null as string | null,
    isDesignByUs: false,
    description: "",
    status: 1,
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Close automatically if no permission
  useEffect(() => {
    if (open && !hasAccess) {
      toast.error("You don't have permission for this action");
      onClose();
    }
  }, [open, hasAccess]);

  useEffect(() => {
    if (!open) return;

    if (product) {
      setForm({
        productID: product.productID ?? null,
        productName: product.productName ?? "",
        category: product.category ?? "",
        unitType: product.unitTypeId ?? "",
        defaultRate: product.defaultRate ?? "",
        purchasePrice: product.purchasePrice ?? "",
        hsnCode: product.hsnCode ?? "",
        taxCategoryID: product.taxCategoryID ?? null,
        isDesignByUs: product.isDesignByUs ?? false,
        description: product.description ?? "",
        status: product.status ?? 1,
      });
    } else {
      setForm(initialForm);
    }

    setErrors({});
  }, [open, product]);

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.productName.trim())
      e.productName = "Product name is required";
    else if (form.productName.trim().length < 2)
      e.productName = "Min 2 characters";

    if (!form.unitType)
      e.unitType = "Unit Type is required";

    if (form.defaultRate === "" || Number(form.defaultRate) <= 0)
      e.defaultRate = "Default Rate is required and must be greater than 0";

    if (form.purchasePrice === "" || Number(form.purchasePrice) <= 0)
      e.purchasePrice = "Purchase Price is required and must be greater than 0";

    setErrors(e);

    if (Object.keys(e).length) {
      toast.error("Please fix validation errors");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    // ✅ Permission guard
    if (!hasAccess) {
      toast.error("Permission denied");
      return;
    }

    if (!validate()) return;

    const payload = {
      productID: form.productID,
      productName: form.productName.trim(),
      category: form.category.trim() || null,
      unitType: form.unitType || null,
      defaultRate:
        form.defaultRate !== "" ? Number(form.defaultRate) : null,
      purchasePrice:
        form.purchasePrice !== "" ? Number(form.purchasePrice) : null,
      hsnCode: form.hsnCode.trim() || null,
      taxCategoryID: form.taxCategoryID || null,
      isDesignByUs: form.isDesignByUs,
      description: form.description.trim() || null,
      status: form.status,
    };

    const result = await mutateAsync(payload);

    toast.success(
      `Product ${product ? "updated" : "created"} successfully`
    );

    onClose();
    onSuccess(result?.data);
  };

  if (!open || !hasAccess) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-[60]"
        onClick={isPending ? undefined : onClose}
      />

      <div className="fixed top-0 right-0 h-screen w-[440px] bg-white z-[70] shadow-2xl flex flex-col">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            {product ? "Edit Product" : "Add Product"}
          </h2>

          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1 rounded hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY (UNCHANGED — YOUR ORIGINAL UI) */}
        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* Product Name */}
        <Field label="Product Name" required error={errors.productName}>
          <input
            className={`input w-full ${errors.productName ? "border-red-500" : ""}`}
            placeholder="Enter product name"
            value={form.productName}
            onChange={(e) => setForm({ ...form, productName: e.target.value })}
          />
        </Field>

        {/* Category */}
        <Field label="Category">
          <input
            className="input w-full"
            placeholder="Enter category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </Field>

        {/* Unit Type */}
        <Field label="Unit Type" required error={errors.unitType}>
          <AntSelect
            showSearch
            className="w-full h-10"
            value={form.unitType || undefined}
            onChange={(val) => setForm({ ...form, unitType: val })}
            placeholder="Select Unit Type"
            optionFilterProp="children"
            loading={unitLoading}
          >
            {unitTypes?.data?.map((u: any) => (
              <AntSelect.Option key={u.unitTypeID} value={u.unitTypeID}>
                {u.unitName}
              </AntSelect.Option>
            ))}
          </AntSelect>
        </Field>

        {/* Price Row */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Default Rate" required error={errors.defaultRate}>
            <input
              type="number"
              placeholder="0.00"
              className={`input w-full ${errors.defaultRate ? "border-red-500" : ""}`}
              value={form.defaultRate}
              onChange={(e) =>
                setForm({
                  ...form,
                  defaultRate: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </Field>

          <Field label="Purchase Price" required error={errors.purchasePrice}>
            <input
              type="number"
              placeholder="0.00"
              className={`input w-full ${errors.purchasePrice ? "border-red-500" : ""}`}
              value={form.purchasePrice}
              onChange={(e) =>
                setForm({
                  ...form,
                  purchasePrice: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
            />
          </Field>
        </div>

        {/* HSN */}
        <Field label="HSN Code">
          <input
            className="input w-full"
            placeholder="Enter HSN code"
            value={form.hsnCode}
            onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
          />
        </Field>

        {/* Tax Category */}
        <Field label="Tax Category">
          <AntSelect
            showSearch
            className="w-full h-10"
            value={form.taxCategoryID || undefined}
            onChange={(val) => setForm({ ...form, taxCategoryID: val || null })}
            placeholder="Select Tax Category"
            optionFilterProp="children"
            loading={taxLoading}
            allowClear
          >
            {taxCategories?.map((t: any) => (
              <AntSelect.Option key={t.taxCategoryID} value={t.taxCategoryID}>
                {t.taxName || t.categoryName}
              </AntSelect.Option>
            ))}
          </AntSelect>
        </Field>

        {/* Design Toggle */}
        <Field label="Design By Us">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.isDesignByUs}
                onChange={(e) =>
                  setForm({ ...form, isDesignByUs: e.target.checked })
                }
              />
              <div
                className={`w-10 h-5 rounded-full transition ${
                  form.isDesignByUs ? "bg-[var(--btn-primary)]" : "bg-slate-300"
                }`}
              />
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition ${
                  form.isDesignByUs ? "translate-x-5" : ""
                }`}
              />
            </div>
            <span className="text-sm text-slate-600">
              {form.isDesignByUs ? "Yes" : "No"}
            </span>
          </label>
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            className="input w-full"
            rows={3}
            placeholder="Enter description..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Field>

        {/* Status */}
        <Field label="Status">
          <AntSelect
            className="w-full h-10"
            value={form.status}
            onChange={(val) => setForm({ ...form, status: val })}
          >
            <AntSelect.Option value={1}>Active</AntSelect.Option>
            <AntSelect.Option value={0}>Inactive</AntSelect.Option>
          </AntSelect>
        </Field>

        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t flex gap-3">
          <button
            className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-slate-50"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>

          <button
            disabled={isPending || !hasAccess}
            className="flex-1 btn-primary rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
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

export default ProductUpsertSheet;

/* helper */
const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="text-sm font-medium text-slate-700 mb-1 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);