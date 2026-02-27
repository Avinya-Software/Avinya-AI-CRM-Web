// src/components/product/ProductUpsertSheet.tsx
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import { useUpsertProduct } from "../../hooks/product/useUpsertProduct";
import Spinner from "../common/Spinner";
import type { Product } from "../../interfaces/product.interface";
import { useUnitTypeDropdown } from "../../hooks/product/useUnitTypeDropdown";

// Hook to fetch unit type dropdown from /api/Product/get-UnitType-dropdown


interface Props {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

const ProductUpsertSheet = ({ open, onClose, product, onSuccess }: Props) => {
  const { mutateAsync, isPending } = useUpsertProduct();
  const { data: unitTypes, isLoading: unitLoading } = useUnitTypeDropdown();
  
  const initialForm = {
    productID: null as string | null,
    productName: "",
    category: "",
    unitType: "",           // unitTypeID (guid) sent to API
    defaultRate: "" as number | string,
    purchasePrice: "" as number | string,
    hsnCode: "",
    taxCategoryID: null as string | null,
    isDesignByUs: false,
    description: "",
    status: 1,              // 1=Active, 0=Inactive
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

    // Product Name
    if (!form.productName.trim())
      e.productName = "Product name is required";
    else if (form.productName.trim().length < 2)
      e.productName = "Min 2 characters";

    // Unit Type
    if (!form.unitType)
      e.unitType = "Unit Type is required";

    // Default Rate
    if (form.defaultRate === "" || Number(form.defaultRate) <= 0)
      e.defaultRate = "Default Rate is required and must be greater than 0";

    // Purchase Price
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
    if (!validate()) return;

    const payload = {
      productID: form.productID,
      productName: form.productName.trim(),
      category: form.category.trim() || null,
      unitType: form.unitType || null,
      defaultRate: form.defaultRate !== "" ? Number(form.defaultRate) : null,
      purchasePrice: form.purchasePrice !== "" ? Number(form.purchasePrice) : null,
      hsnCode: form.hsnCode.trim() || null,
      taxCategoryID: form.taxCategoryID || null,
      isDesignByUs: form.isDesignByUs,
      description: form.description.trim() || null,
      status: form.status,
    };

    await mutateAsync(payload);
    toast.success(`Product ${product ? "updated" : "created"} successfully`);
    onClose();
    onSuccess();
  };

  if (!open) return null;

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
          <button onClick={onClose} disabled={isPending} className="p-1 rounded hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* Product Name */}
          <Field label="Product Name" required error={errors.productName}>
            <input
              className={`input w-full ${errors.productName ? "border-red-500" : ""}`}
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              placeholder="e.g. LED Board Installation"
            />
          </Field>

          {/* Category */}
          <Field label="Category">
            <input
              className="input w-full"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Signage Services"
            />
          </Field>

          {/* Unit Type — from /api/Product/get-UnitType-dropdown */}
          <Field
            label="Unit Type"
            required
            error={errors.unitType}
          >
            {unitLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400"><Spinner /> Loading...</div>
            ) : (
              <select
                className={`input w-full ${errors.unitType ? "border-red-500" : ""}`}
                value={form.unitType}
                onChange={(e) => setForm({ ...form, unitType: e.target.value })}
              >
                <option value="">Select Unit Type</option>
                {unitTypes.data.map((u: any) => (
                  <option key={u.unitTypeID} value={u.unitTypeID}>
                    {u.unitName}
                  </option>
                ))}
              </select>
            )}
          </Field>

          {/* Default Rate */}
          <Field
            label="Default Rate (₹)"
            required
            error={errors.defaultRate}
          >
            <input
              type="number"
              min={0}
              className={`input w-full ${errors.defaultRate ? "border-red-500" : ""}`}
              value={form.defaultRate}
              onChange={(e) => setForm({ ...form, defaultRate: e.target.value })}
              placeholder="0.00"
            />
          </Field>

          {/* Purchase Price */}
          <Field
            label="Purchase Price (₹)"
            required
            error={errors.purchasePrice}
          >
            <input
              type="number"
              min={0}
              className={`input w-full ${errors.purchasePrice ? "border-red-500" : ""}`}
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
              placeholder="0.00"
            />
          </Field>

          {/* HSN Code */}
          <Field label="HSN Code">
            <input
              className="input w-full"
              value={form.hsnCode}
              onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
              placeholder="e.g. 4901"
            />
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              className="input w-full h-20 resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional product description"
            />
          </Field>

          {/* Design By Us */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-700">Design By Us</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, isDesignByUs: !form.isDesignByUs })}
              className={`relative w-11 h-6 rounded-full transition ${form.isDesignByUs ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition transform ${form.isDesignByUs ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg">
            <span className="text-sm font-medium text-slate-700">Active</span>
            <button
              type="button"
              onClick={() => setForm({ ...form, status: form.status === 1 ? 0 : 1 })}
              className={`relative w-11 h-6 rounded-full transition ${form.status === 1 ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition transform ${form.status === 1 ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>

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
            disabled={isPending}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50"
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

// ── Helper wrapper ─────────────────────────────────────────────────
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