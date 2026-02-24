// src/components/quotations/QuotationUpsertSheet.tsx
import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Quotation, QuotationStatus } from "../../interfaces/quotation.interface";


interface QuotationUpsertSheetProps {
    open: boolean;
    onClose: () => void;
    quotation: Quotation | null;
}

interface ProductItem {
    id: string;
    product: string;
    unitType: string;
    price: number;
    quantity: number;
    taxPercent: number;
}

const QuotationUpsertSheet = ({
    open,
    onClose,
    quotation,
}: QuotationUpsertSheetProps) => {
    const isEdit = !!quotation;
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        firmName: "",
        companyName: "",
        validTill: "",
        termsAndConditions: "",
        enableTax: true,
        status: "Draft" as QuotationStatus,
    });

    const [productItems, setProductItems] = useState<ProductItem[]>([
        {
            id: "1",
            product: "",
            unitType: "",
            price: 0,
            quantity: 0,
            taxPercent: 0,
        },
    ]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (quotation) {
            setFormData({
                firmName: quotation.firmName,
                companyName: quotation.companyName,
                validTill: quotation.validTill,
                termsAndConditions: quotation.termsAndConditions || "",
                enableTax: quotation.enableTax,
                status: quotation.statusName || "Draft",
            });
            // TODO: Load product items from quotation
        } else {
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 15);
            setFormData({
                firmName: "Heaven Design", // Default firm
                companyName: "",
                validTill: defaultDate.toISOString().substring(0, 10),
                termsAndConditions:
                    "These are the default terms and conditions for Avinya. You can update this text from the admin panel.",
                enableTax: true,
                status: "Draft",
            });
            setProductItems([
                {
                    id: "1",
                    product: "",
                    unitType: "",
                    price: 0,
                    quantity: 0,
                    taxPercent: 0,
                },
            ]);
        }
        setErrors({});
    }, [quotation, open]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firmName.trim()) newErrors.firmName = "Firm is required";
        if (!formData.companyName.trim())
            newErrors.companyName = "Company is required";
        if (!formData.validTill) newErrors.validTill = "Valid till is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        // TODO: API call to create/update quotation
        setTimeout(() => {
            setIsLoading(false);
            onClose();
        }, 1000);
    };

    const addProductItem = () => {
        setProductItems([
            ...productItems,
            {
                id: Date.now().toString(),
                product: "",
                unitType: "",
                price: 0,
                quantity: 0,
                taxPercent: 0,
            },
        ]);
    };

    const removeProductItem = (id: string) => {
        if (productItems.length === 1) return;
        setProductItems(productItems.filter((item) => item.id !== id));
    };

    const updateProductItem = (
        id: string,
        field: keyof ProductItem,
        value: string | number
    ) => {
        setProductItems(
            productItems.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    // Calculate totals
    const subtotal = productItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const totalTax = formData.enableTax
        ? productItems.reduce(
            (sum, item) =>
                sum + (item.price * item.quantity * item.taxPercent) / 100,
            0
        )
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
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                    >
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Firm & Company */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Firm <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.firmName}
                                onChange={(e) =>
                                    setFormData({ ...formData, firmName: e.target.value })
                                }
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.firmName
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-slate-300 focus:ring-blue-500"
                                    }`}
                                disabled={isEdit}
                            >
                                <option value="">Select Firm</option>
                                <option value="Heaven Design">Heaven Design</option>
                                <option value="Acme Corp">Acme Corp</option>
                            </select>
                            {errors.firmName && (
                                <p className="text-red-500 text-xs mt-1">{errors.firmName}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.companyName}
                                onChange={(e) =>
                                    setFormData({ ...formData, companyName: e.target.value })
                                }
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.companyName
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-slate-300 focus:ring-blue-500"
                                    }`}
                                disabled={isEdit}
                            >
                                <option value="">Select Company</option>
                                <option value="Shivam Packaging Solutions">
                                    Shivam Packaging Solutions
                                </option>
                                <option value="Aarav Technologies Pvt Ltd">
                                    Aarav Technologies Pvt Ltd
                                </option>
                                <option value="shree textile solutions">
                                    shree textile solutions
                                </option>
                            </select>
                            {errors.companyName && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.companyName}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Valid Till */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Valid Till (Optional)
                        </label>
                        <input
                            type="date"
                            value={formData.validTill}
                            onChange={(e) =>
                                setFormData({ ...formData, validTill: e.target.value })
                            }
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {/* Terms and Conditions */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Terms and Conditions
                        </label>
                        <textarea
                            value={formData.termsAndConditions}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    termsAndConditions: e.target.value,
                                })
                            }
                            rows={3}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            placeholder="Enter terms and conditions..."
                        />
                    </div>

                    {/* Enable Tax Toggle */}
                    <div className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">
                            Enable Tax
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setFormData({ ...formData, enableTax: !formData.enableTax })
                            }
                            className={`relative w-12 h-6 rounded-full transition ${formData.enableTax ? "bg-blue-600" : "bg-slate-300"
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition transform shadow-sm ${formData.enableTax ? "translate-x-6" : "translate-x-0"
                                    }`}
                            />
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

                        {/* Product Table */}
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                            Product
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                            Unit Type
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                            Price
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                            Quantity
                                        </th>
                                        {formData.enableTax && (
                                            <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">
                                                Tax %
                                            </th>
                                        )}
                                        <th className="px-3 py-2 text-center text-xs font-medium text-slate-600 w-12">

                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {productItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={item.product}
                                                    onChange={(e) =>
                                                        updateProductItem(item.id, "product", e.target.value)
                                                    }
                                                    placeholder="Select product"
                                                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    value={item.unitType}
                                                    onChange={(e) =>
                                                        updateProductItem(item.id, "unitType", e.target.value)
                                                    }
                                                    placeholder="Unit"
                                                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={item.price || ""}
                                                    onChange={(e) =>
                                                        updateProductItem(
                                                            item.id,
                                                            "price",
                                                            parseFloat(e.target.value) || 0
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    className="w-20 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    value={item.quantity || ""}
                                                    onChange={(e) =>
                                                        updateProductItem(
                                                            item.id,
                                                            "quantity",
                                                            parseFloat(e.target.value) || 0
                                                        )
                                                    }
                                                    placeholder="0.00"
                                                    className="w-20 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
                                            {formData.enableTax && (
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        value={item.taxPercent || ""}
                                                        onChange={(e) =>
                                                            updateProductItem(
                                                                item.id,
                                                                "taxPercent",
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        placeholder="0"
                                                        className="w-16 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    />
                                                </td>
                                            )}
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeProductItem(item.id)}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition"
                                                    disabled={productItems.length === 1}
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
                            <span className="font-semibold text-slate-800">
                                ₹{subtotal.toFixed(2)}
                            </span>
                        </div>
                        {formData.enableTax && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Total Tax:</span>
                                <span className="font-semibold text-slate-800">
                                    ₹{totalTax.toFixed(2)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-base font-bold border-t border-slate-200 pt-2">
                            <span className="text-slate-900">Grand Total:</span>
                            <span className="text-blue-900">₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Status (Edit only) */}
                    {isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value as QuotationStatus,
                                    })
                                }
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Sent">Sent</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium text-slate-700"
                            disabled={isLoading}
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