// src/components/quotations/QuotationUpsertSheet.tsx
import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Quotation, TaxCategory } from "../../interfaces/quotation.interface";
import { ProductDropdown } from "../../interfaces/product.interface";
import { useClientsDropdown } from "../../hooks/client/useClients";
import { useSettings } from "../../hooks/setting/useSettings";
import { useProductDropdown } from "../../hooks/product/useProductDropdown";
import { useTaxCategories } from "../../hooks/taxCategory/taxCategory";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useCreateQuotation, useUpdateQuotation } from "../../hooks/quotation/Usequotationmutations ";

interface QuotationUpsertSheetProps {
    open: boolean;
    onClose: () => void;
    quotation: Quotation | null;
    onSuccess?: () => void;
}

interface ProductItem {
    id: string;                  // local key only
    quotationItemID: string | null;
    productID: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxCategoryID: string;
    // UI helpers
    unitType: string;
}

// Status options — map display name → UUID from your API
const STATUS_OPTIONS = [
    { label: "Draft", value: "7A0A702A-FCA4-4950-B897-DD1E863D8FB6" },
    { label: "Sent", value: "SENT-UUID-HERE" },
    { label: "Accepted", value: "ACCEPTED-UUID-HERE" },
    { label: "Rejected", value: "REJECTED-UUID-HERE" },
];

const QuotationUpsertSheet = ({
    open,
    onClose,
    quotation,
    onSuccess,
}: QuotationUpsertSheetProps) => {
    const isEdit = !!quotation;

    const createdBy = useSelector((state: RootState) => (state.auth as any).userId ?? (state.auth as any).advisorId ?? "");

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        clientID: "",
        leadID: null as string | null,
        quotationDate: new Date().toISOString().substring(0, 10),
        validTill: "",
        status: STATUS_OPTIONS[0].value,
        firmID: 1,
        rejectedNotes: "",
        termsAndConditions: "",
        enableTax: true,
    });

    const [productItems, setProductItems] = useState<ProductItem[]>([
        {
            id: "1",
            quotationItemID: null,
            productID: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxCategoryID: "",
            unitType: "",
        },
    ]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const { data: clients = [] } = useClientsDropdown();
    const { data: settings = [] } = useSettings();
    const { data: products = [] } = useProductDropdown();
    const { data: taxCategories = [] } = useTaxCategories();

    const createQuotation = useCreateQuotation();
    const updateQuotation = useUpdateQuotation();

    // ---------- Defaults from settings ----------
    useEffect(() => {
        if (!settings || settings.length === 0) return;
        const termsSetting = settings.find((s: any) => s.entityType === "TermsAndConditions");
        if (termsSetting?.value && !quotation) {
            setFormData(prev => ({ ...prev, termsAndConditions: termsSetting.value }));
        }
    }, [settings, quotation]);

    // ---------- Populate form on open ----------
    useEffect(() => {
        if (!open) return;

        if (quotation) {
            // EDIT MODE — map existing quotation to form
            setFormData({
                clientID: quotation.clientID || "",
                leadID: quotation.leadID || null,
                quotationDate: quotation.quotationDate
                    ? new Date(quotation.quotationDate).toISOString().substring(0, 10)
                    : new Date().toISOString().substring(0, 10),
                validTill: quotation.validTill
                    ? new Date(quotation.validTill).toISOString().substring(0, 10)
                    : "",
                status: quotation.status || STATUS_OPTIONS[0].value,
                firmID: quotation.firmID || 1,
                rejectedNotes: quotation.rejectedNotes || "",
                termsAndConditions: quotation.termsAndConditions || "",
                enableTax: quotation.enableTax ?? true,
            });

            if (quotation.items && quotation.items.length > 0) {
                setProductItems(
                    quotation.items.map((item: any, idx: number) => ({
                        id: String(idx + 1),
                        quotationItemID: item.quotationItemID || null,
                        productID: item.productID || "",
                        description: item.description || "",
                        quantity: item.quantity || 1,
                        unitPrice: item.unitPrice || 0,
                        taxCategoryID: item.taxCategoryID || "",
                        unitType: item.unitType || "",
                    }))
                );
            }
        } else {
            // CREATE MODE
            const validTill = new Date();
            validTill.setDate(validTill.getDate() + 15);

            setFormData(prev => ({
                ...prev,
                clientID: "",
                leadID: null,
                quotationDate: new Date().toISOString().substring(0, 10),
                validTill: validTill.toISOString().substring(0, 10),
                status: STATUS_OPTIONS[0].value,
                firmID: 1,
                rejectedNotes: "",
                enableTax: true,
            }));

            setProductItems([{
                id: "1",
                quotationItemID: null,
                productID: "",
                description: "",
                quantity: 1,
                unitPrice: 0,
                taxCategoryID: "",
                unitType: "",
            }]);
        }

        setErrors({});
    }, [quotation, open]);

    // ---------- Validation ----------
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.clientID) newErrors.clientID = "Company is required";
        if (!formData.validTill) newErrors.validTill = "Valid till is required";
        const hasEmptyProduct = productItems.some(i => !i.productID);
        if (hasEmptyProduct) newErrors.items = "All product rows must have a product selected";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ---------- Build payload ----------
    const buildPayload = () => {
        const subtotal = productItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
        const totalTax = formData.enableTax
            ? productItems.reduce((sum, i) => {
                const cat = (taxCategories as TaxCategory[]).find(t => t.taxCategoryID === i.taxCategoryID);
                const pct = cat?.rate ?? 0;
                return sum + (i.unitPrice * i.quantity * pct) / 100;
            }, 0)
            : 0;

        return {
            quotationID: isEdit ? quotation?.quotationID : null,
            quotationNo: isEdit ? quotation?.quotationNo : "",
            clientID: formData.clientID,
            leadID: formData.leadID,
            quotationDate: new Date(formData.quotationDate).toISOString(),
            validTill: new Date(formData.validTill).toISOString(),
            status: formData.status,
            firmID: formData.firmID,
            rejectedNotes: formData.rejectedNotes,
            termsAndConditions: formData.termsAndConditions,
            totalAmount: subtotal,
            taxes: totalTax,
            enableTax: formData.enableTax,
            grandTotal: subtotal + totalTax,
            createdBy: createdBy,
            items: productItems.map(i => ({
                quotationItemID: i.quotationItemID,
                productID: i.productID,
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                taxCategoryID: i.taxCategoryID || null,
            })),
        };
    };

    // ---------- Submit ----------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = buildPayload();
        setIsLoading(true);

        if (isEdit) {
            updateQuotation.mutate(
                {
                    id: quotation!.quotationID,
                    data: payload,
                },
                {
                    onSuccess: () => {
                        setIsLoading(false);
                        onSuccess?.();
                        onClose();
                    },
                    onError: () => setIsLoading(false),
                }
            );
        } else {
            createQuotation.mutate(payload, {
                onSuccess: () => { setIsLoading(false); onSuccess?.(); onClose(); },
                onError: () => setIsLoading(false),
            });
        }
    };

    // ---------- Product item helpers ----------
    const addProductItem = () => {
        setProductItems(prev => [...prev, {
            id: Date.now().toString(),
            quotationItemID: null,
            productID: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxCategoryID: "",
            unitType: "",
        }]);
    };

    const removeProductItem = (id: string) => {
        if (productItems.length === 1) return;
        setProductItems(prev => prev.filter(i => i.id !== id));
    };

    const updateItem = <K extends keyof ProductItem>(id: string, field: K, value: ProductItem[K]) => {
        setProductItems(prev =>
            prev.map(item => item.id === id ? { ...item, [field]: value } : item)
        );
    };

    const handleProductChange = (itemId: string, productID: string) => {
        const selected = (products as ProductDropdown[])?.find(p => p.productID === productID);
        if (!selected) return;
        setProductItems(prev =>
            prev.map(item =>
                item.id === itemId
                    ? {
                        ...item,
                        productID: selected.productID,
                        description: selected.description || selected.productName || "",
                        unitType: selected.unitName != null ? String(selected.unitName) : "",
                    }
                    : item
            )
        );
    };

    // ---------- Totals ----------
    const subtotal = productItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const totalTax = formData.enableTax
        ? productItems.reduce((sum, i) => {
            const cat = (taxCategories as TaxCategory[]).find(t => t.taxCategoryID === i.taxCategoryID);
            const pct = cat?.rate ?? 0;
            return sum + (i.unitPrice * i.quantity * pct) / 100;
        }, 0)
        : 0;
    const grandTotal = subtotal + totalTax;

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {isEdit ? "Edit Quotation" : "Create New Quotation"}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Row: Company + Quotation Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.clientID}
                                onChange={(e) => setFormData({ ...formData, clientID: e.target.value })}
                                disabled={isEdit}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.clientID ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-blue-500"
                                    }`}
                            >
                                <option value="">Select Company</option>
                                {clients.map((c: any) => (
                                    <option key={c.clientID} value={c.clientID}>
                                        {c.companyName || "Unknown"}
                                    </option>
                                ))}
                            </select>
                            {errors.clientID && <p className="text-red-500 text-xs mt-1">{errors.clientID}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Quotation Date
                            </label>
                            <input
                                type="date"
                                value={formData.quotationDate}
                                onChange={(e) => setFormData({ ...formData, quotationDate: e.target.value })}
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Valid Till */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Valid Till
                        </label>
                        <input
                            type="date"
                            value={formData.validTill}
                            onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.validTill ? "border-red-500 focus:ring-red-500" : "border-slate-300 focus:ring-blue-500"
                                }`}
                        />
                        {errors.validTill && <p className="text-red-500 text-xs mt-1">{errors.validTill}</p>}
                    </div>

                    {/* Terms and Conditions */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Terms and Conditions
                        </label>
                        <textarea
                            value={formData.termsAndConditions}
                            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                            rows={3}
                            placeholder="Enter terms and conditions..."
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        />
                    </div>

                    {/* Enable Tax Toggle */}
                    <div className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Enable Tax</span>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, enableTax: !formData.enableTax })}
                            className={`relative w-12 h-6 rounded-full transition ${formData.enableTax ? "bg-blue-600" : "bg-slate-300"}`}
                        >
                            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition transform shadow-sm ${formData.enableTax ? "translate-x-6" : "translate-x-0"}`} />
                        </button>
                    </div>

                    {/* Product Items */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium text-slate-700">
                                Product Items <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={addProductItem}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                            >
                                <Plus size={14} />
                                Add Product
                            </button>
                        </div>

                        {errors.items && <p className="text-red-500 text-xs mb-2">{errors.items}</p>}

                        <div className="border border-slate-200 rounded-lg overflow-x-auto">
                            <table className="w-full text-sm min-w-[700px]">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Product</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Description</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Unit</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Unit Price</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Qty</th>
                                        {formData.enableTax && (
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Tax Category</th>
                                        )}
                                        <th className="px-3 py-2 text-center text-xs font-medium text-slate-600 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {productItems.map((item) => (
                                        <tr key={item.id}>
                                            {/* Product */}
                                            <td className="px-3 py-2">
                                                <select
                                                    value={item.productID}
                                                    onChange={(e) => handleProductChange(item.id, e.target.value)}
                                                    className="w-36 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="">Select</option>
                                                    {(products as ProductDropdown[])?.map(p => (
                                                        <option key={p.productID} value={p.productID}>
                                                            {p.productName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Description */}
                                            <td className="px-3 py-2">
                                                <input
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                                    placeholder="Description"
                                                    className="w-36 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>

                                            {/* Unit (readonly) */}
                                            <td className="px-3 py-2">
                                                <input
                                                    value={item.unitType}
                                                    readOnly
                                                    className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-500"
                                                />
                                            </td>

                                            {/* Unit Price */}
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={item.unitPrice || ""}
                                                    onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0 as number)}
                                                    placeholder="0.00"
                                                    className="w-24 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity || ""}
                                                    onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 1 as number)}
                                                    placeholder="1"
                                                    className="w-16 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>

                                            {/* Tax Category Dropdown */}
                                            {formData.enableTax && (
                                                <td className="px-3 py-2">
                                                    <select
                                                        value={item.taxCategoryID}
                                                        onChange={(e) => updateItem(item.id, "taxCategoryID", e.target.value)}
                                                        className="w-36 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="">No Tax</option>
                                                        {(taxCategories as TaxCategory[])?.map(t => (
                                                            <option key={t.taxCategoryID} value={t.taxCategoryID}>
                                                                {t.taxName} ({t.rate}%)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            )}

                                            {/* Remove */}
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeProductItem(item.id)}
                                                    disabled={productItems.length === 1}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition disabled:opacity-30"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">Subtotal:</span>
                            <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
                        </div>
                        {formData.enableTax && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Total Tax:</span>
                                <span className="font-semibold text-slate-800">₹{totalTax.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-base font-bold border-t border-slate-200 pt-2">
                            <span className="text-slate-900">Grand Total:</span>
                            <span className="text-blue-900">₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Status — Edit only */}
                    {isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Rejected Notes — shown only when status is Rejected */}
                    {isEdit && formData.status === STATUS_OPTIONS.find(s => s.label === "Rejected")?.value && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Rejected Notes
                            </label>
                            <textarea
                                value={formData.rejectedNotes}
                                onChange={(e) => setFormData({ ...formData, rejectedNotes: e.target.value })}
                                rows={2}
                                placeholder="Reason for rejection..."
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            />
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {isEdit ? "Update" : "Create"} Quotation
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuotationUpsertSheet;