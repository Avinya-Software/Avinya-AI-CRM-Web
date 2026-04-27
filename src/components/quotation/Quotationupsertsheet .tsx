// src/components/quotations/QuotationUpsertSheet.tsx
import { useState, useEffect } from "react";
import { DatePicker, Select as AntSelect, Divider } from "antd";
import dayjs from "dayjs";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Quotation, TaxCategory, QuotationStatusDropdownItem } from "../../interfaces/quotation.interface";
import { ProductDropdown } from "../../interfaces/product.interface";
import { useClientsDropdown } from "../../hooks/client/useClients";
import { useSettings } from "../../hooks/setting/useSettings";
import { useProductDropdown } from "../../hooks/product/useProductDropdown";
import { useTaxCategories } from "../../hooks/taxCategory/taxCategory";
import { useCreateQuotation, useUpdateQuotation } from "../../hooks/quotation/Usequotationmutations ";
import { usePermissions } from "../../context/PermissionContext";
import { useQuotationStatusDropdown } from "../../hooks/quotation/useQuotations";
import { useAuth } from "../../auth/useAuth";
import ProductQuickAddModal from "../product/ProductQuickAddModal";

interface QuotationUpsertSheetProps {
    open: boolean;
    onClose: () => void;
    quotation: Quotation | null;
    onSuccess?: () => void;
    leadID?: string | null;
    clientID?: string;
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


const QuotationUpsertSheet = ({
    open,
    onClose,
    quotation,
    onSuccess,
    leadID,
    clientID,
}: QuotationUpsertSheetProps) => {
    const { hasPermission } = usePermissions();

    const canAddQuotation = hasPermission("quotation", "add");
    const canEditQuotation = hasPermission("quotation", "edit");
    const { data: statusData = [] } = useQuotationStatusDropdown();
    const isEdit = !!quotation;

    //  Block unauthorized access
    if (open && isEdit && !canEditQuotation) return null;
    if (open && !isEdit && !canAddQuotation) return null;

    const { userId: createdBy = "" } = useAuth();

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        clientID: "",
        leadID: null as string | null,
        quotationDate: dayjs().format("YYYY-MM-DD"),
        validTill: "",
        status: "",
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
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [activeRowId, setActiveRowId] = useState<string | null>(null);

    const clientsDropdownMutation = useClientsDropdown();
    const settingsMutation = useSettings();
    const productDropdownMutation = useProductDropdown();
    const taxCategoriesMutation = useTaxCategories();

    useEffect(() => {
        if (open) {
            clientsDropdownMutation.mutate(undefined);
            settingsMutation.mutate(undefined);
            productDropdownMutation.mutate(undefined);
            taxCategoriesMutation.mutate(undefined);
        }
    }, [open]);

    const clients: any[] = clientsDropdownMutation.data ?? [];
    const settings: any[] = settingsMutation.data ?? [];
    const products: any[] = productDropdownMutation.data ?? [];
    const taxCategories: any[] = taxCategoriesMutation.data ?? [];

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
                    ? dayjs(quotation.quotationDate).format("YYYY-MM-DD")
                    : dayjs().format("YYYY-MM-DD"),
                validTill: quotation.validTill
                    ? dayjs(quotation.validTill).format("YYYY-MM-DD")
                    : "",
                status: quotation.status || "",
                firmID: quotation.firmID || 1,
                rejectedNotes: quotation.rejectedNotes || "",
                termsAndConditions: quotation.termsAndConditions || "",
                enableTax: quotation.enableTax ?? true,
            });

            if (quotation.items && quotation.items.length > 0) {
                setProductItems(
                    quotation.items.map((item: any, idx: number) => {
                        const matchedProduct = products.find(
                            p => p.productID === item.productID
                        );

                        return {
                            id: String(idx + 1),
                            quotationItemID: item.quotationItemID || null,
                            productID: item.productID || "",
                            description: item.description || "",
                            quantity: item.quantity || 1,
                            unitPrice: item.unitPrice || 0,
                            taxCategoryID: item.taxCategoryID || "",
                            unitType: matchedProduct?.unitName || "", // ✅ FIX HERE
                        };
                    })
                );
            }
        } else {
            // CREATE MODE
            const validTill = new Date();
            validTill.setDate(validTill.getDate() + 15);

            setFormData(prev => ({
                ...prev,
                clientID: clientID || "",
                leadID: leadID || null,
                quotationDate: dayjs().format("YYYY-MM-DD"),
                validTill: dayjs(validTill).format("YYYY-MM-DD"),
                status: "",
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
    }, [quotation, open, leadID, clientID]);

    // ---------- Validation ----------
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.clientID) newErrors.clientID = "Company is required";
        if (!formData.validTill) newErrors.validTill = "Valid till is required";
        
        const hasEmptyProduct = productItems.some(i => !i.productID);
        if (hasEmptyProduct) newErrors.items = "All product rows must have a product selected";

        if (formData.enableTax) {
            const hasEmptyTax = productItems.some(i => !i.taxCategoryID);
            if (hasEmptyTax) {
                newErrors.items = (newErrors.items ? newErrors.items + " and " : "") + "Tax Category is required for all items when tax is enabled";
            }
        }

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
            quotationDate: dayjs(formData.quotationDate).format("YYYY-MM-DDTHH:mm:ss"),
            validTill: dayjs(formData.validTill).format("YYYY-MM-DDTHH:mm:ss"),
            status: formData.status != "" ? formData.status : null,
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

        // 🔐 Double protection
        if (isEdit && !canEditQuotation) return;
        if (!isEdit && !canAddQuotation) return;

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
        setProductItems(prev => [{
            id: Date.now().toString(),
            quotationItemID: null,
            productID: "",
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxCategoryID: "",
            unitType: "",
        }, ...prev]);
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
                        unitPrice: selected.defaultRate || 0,
                        taxCategoryID: selected.taxCategoryID || "",
                    }
                    : item
            )
        );
    };

    const handleProductQuickAddSuccess = (newProduct?: any) => {
        productDropdownMutation.mutate(undefined);
        if (newProduct && activeRowId) {
            setProductItems(prev =>
                prev.map(item =>
                    item.id === activeRowId
                        ? {
                            ...item,
                            productID: newProduct.productID,
                            description: newProduct.description || newProduct.productName || "",
                            unitType: newProduct.unitName != null ? String(newProduct.unitName) : "",
                            unitPrice: newProduct.defaultRate || 0,
                            taxCategoryID: newProduct.taxCategoryID || "",
                        }
                        : item
                )
            );
        }
        setIsProductModalOpen(false);
        setActiveRowId(null);
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

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
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
                            <AntSelect
                                showSearch
                                value={formData.clientID || undefined}
                                onChange={(val) => setFormData({ ...formData, clientID: val })}
                                disabled={isEdit}
                                className={`w-full h-10 ${errors.clientID ? "ant-select-error" : ""}`}
                                placeholder="Select Company"
                                optionFilterProp="children"
                            >
                                {clients.map((c: any) => (
                                    <AntSelect.Option key={c.clientID} value={c.clientID}>
                                        {c.companyName || "Unknown"}
                                    </AntSelect.Option>
                                ))}
                            </AntSelect>
                            {errors.clientID && <p className="text-red-500 text-xs mt-1">{errors.clientID}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Quotation Date
                            </label>
                            <DatePicker
                                className="w-full h-10 border-slate-300 rounded-lg"
                                format="YYYY-MM-DD"
                                placeholder="Select quotation date"
                                value={formData.quotationDate ? dayjs(formData.quotationDate) : null}
                                onChange={(date, dateString) =>
                                    setFormData({ ...formData, quotationDate: Array.isArray(dateString) ? dateString[0] : dateString })
                                }
                            />
                        </div>
                    </div>

                    {/* Valid Till */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Valid Till
                        </label>
                        <DatePicker
                            className={`w-full h-10 rounded-lg ${errors.validTill ? "border-red-500" : "border-slate-300"}`}
                            format="YYYY-MM-DD"
                            placeholder="Select valid till date"
                            value={formData.validTill ? dayjs(formData.validTill) : null}
                            onChange={(date, dateString) =>
                                setFormData({ ...formData, validTill: Array.isArray(dateString) ? dateString[0] : dateString })
                            }
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
                            className={`relative w-12 h-6 rounded-full transition ${formData.enableTax ? "bg-[var(--btn-primary)]" : "bg-slate-300"}`}
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
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 btn-primary rounded-lg text-xs font-medium transition"
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
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                                Tax Category <span className="text-red-500">*</span>
                                            </th>
                                        )}
                                        <th className="px-3 py-2 text-center text-xs font-medium text-slate-600 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {productItems.map((item) => (
                                        <tr key={item.id}>
                                            {/* Product */}
                                            <td className="px-3 py-2">
                                                <AntSelect
                                                    showSearch
                                                    value={item.productID || undefined}
                                                    onChange={(val) => handleProductChange(item.id, val)}
                                                    className="w-36 h-9"
                                                    placeholder="Select"
                                                    optionFilterProp="children"
                                                    dropdownRender={(menu) => (
                                                        <>
                                                            {menu}
                                                            <Divider style={{ margin: '8px 0' }} />
                                                            <div className="px-2 pb-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setActiveRowId(item.id);
                                                                        setIsProductModalOpen(true);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition"
                                                                >
                                                                    <Plus size={14} />
                                                                    Add New Product
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                >
                                                    {(products as ProductDropdown[])?.map(p => (
                                                        <AntSelect.Option key={p.productID} value={p.productID}>
                                                            {p.productName}
                                                        </AntSelect.Option>
                                                    ))}
                                                </AntSelect>
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
                                                    <AntSelect
                                                        showSearch
                                                        value={item.taxCategoryID || undefined}
                                                        onChange={(val) => updateItem(item.id, "taxCategoryID", val)}
                                                        className="w-36 h-9"
                                                        placeholder="No Tax"
                                                        allowClear
                                                        optionFilterProp="children"
                                                    >
                                                        {(taxCategories as TaxCategory[])?.map(t => (
                                                            <AntSelect.Option key={t.taxCategoryID} value={t.taxCategoryID}>
                                                                {t.taxName} ({t.rate}%)
                                                            </AntSelect.Option>
                                                        ))}
                                                    </AntSelect>
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
                            <AntSelect
                                showSearch
                                value={formData.status || undefined}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                                className="w-full h-10"
                                placeholder="Select Status"
                                optionFilterProp="children"
                            >
                                {(statusData as QuotationStatusDropdownItem[]).map((o) => (
                                    <AntSelect.Option key={o.quotationStatusID} value={o.quotationStatusID}>
                                        {o.statusName}
                                    </AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>
                    )}

                    {/* Rejected Notes — shown only when status is Rejected */}
                    {isEdit && formData.status === (statusData as QuotationStatusDropdownItem[]).find(s => s.statusName === "Rejected")?.quotationStatusID && (
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
                            className="flex-1 px-4 py-2.5 btn-primary rounded-lg transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
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

            <ProductQuickAddModal
                open={isProductModalOpen}
                onClose={() => {
                    setIsProductModalOpen(false);
                    setActiveRowId(null);
                }}
                onSuccess={handleProductQuickAddSuccess}
            />
        </div>
    );
};

export default QuotationUpsertSheet;
