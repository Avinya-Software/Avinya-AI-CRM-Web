// src/components/order/OrderUpsertSheet.tsx
import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import type { Order, CreateOrderDto, OrderItemDto } from "../../interfaces/order.interface";
import { ProductDropdown } from "../../interfaces/product.interface";
import { useClientsDropdown } from "../../hooks/client/useClients";
import { useProductDropdown } from "../../hooks/product/useProductDropdown";
import { useCreateOrder, useUpdateOrder } from "../../hooks/order/useOrders";
import { useCities } from "../../hooks/city/useCities";
import { useStates } from "../../hooks/state/useStates";


// ── Types ───────────────────────────────────────────────────────────
interface OrderUpsertSheetProps {
    open: boolean;
    onClose: () => void;
    order: Order | null;
    onSuccess?: () => void;
}

interface ProductItem {
    id: string;                   // local key only
    orderItemId: string | null;
    productID: string;
    description: string;
    unitType: string;             // auto-filled from product, read-only
    unitPrice: number;
    quantity: number;
}

// ── Component ───────────────────────────────────────────────────────
const OrderUpsertSheet = ({
    open,
    onClose,
    order,
    onSuccess,
}: OrderUpsertSheetProps) => {
    const isEdit = !!order;

    const [isLoading, setIsLoading] = useState(false);

    // ── Form state ──────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        clientID: "",
        orderDate: new Date().toISOString().substring(0, 10),
        expectedDeliveryDate: "",
        isUseBillingAddress: false,
        shippingAddress: "",
        stateID: "" as string,    // kept as string for <select> value binding
        cityID: "" as string,
    });

    const [productItems, setProductItems] = useState<ProductItem[]>([{
        id: "1",
        orderItemId: null,
        productID: "",
        description: "",
        unitType: "",
        unitPrice: 0,
        quantity: 1,
    }]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Dropdown data ───────────────────────────────────────────────
    const { data: clients = [] } = useClientsDropdown();
    const { data: products = [] } = useProductDropdown();
    const { data: states = [] } = useStates();
    // Only fetch cities once a state is selected
    const { data: cities = [] } = useCities(
        formData.stateID ? Number(formData.stateID) : null
    );

    const createOrder = useCreateOrder();
    const updateOrder = useUpdateOrder();

    // ── Reset city when state changes ───────────────────────────────
    const handleStateChange = (stateID: string) => {
        setFormData(prev => ({ ...prev, stateID, cityID: "" }));
    };

    // ── Populate form on open ───────────────────────────────────────
    useEffect(() => {
        if (!open) return;

        if (order) {
            // EDIT MODE
            setFormData({
                clientID: order.clientID || "",
                orderDate: order.orderDate
                    ? new Date(order.orderDate).toISOString().substring(0, 10)
                    : new Date().toISOString().substring(0, 10),
                expectedDeliveryDate: order.expectedDeliveryDate
                    ? new Date(order.expectedDeliveryDate).toISOString().substring(0, 10)
                    : "",
                isUseBillingAddress: order.isUseBillingAddress ?? false,
                shippingAddress: order.shippingAddress || "",
                stateID: order.stateID != null ? String(order.stateID) : "",
                cityID: order.cityID != null ? String(order.cityID) : "",
            });

            if (order.items && order.items.length > 0) {
                setProductItems(
                    order.items.map((item, idx) => ({
                        id: String(idx + 1),
                        orderItemId: item.orderItemID || null,
                        productID: item.productID || "",
                        description: item.description || "",
                        unitType: item.unitType || "",
                        unitPrice: item.unitPrice || 0,
                        quantity: item.quantity || 1,
                    }))
                );
            }
        } else {
            // CREATE MODE — default delivery 15 days out
            const delivery = new Date();
            delivery.setDate(delivery.getDate() + 15);

            setFormData({
                clientID: "",
                orderDate: new Date().toISOString().substring(0, 10),
                expectedDeliveryDate: delivery.toISOString().substring(0, 10),
                isUseBillingAddress: false,
                shippingAddress: "",
                stateID: "",
                cityID: "",
            });

            setProductItems([{
                id: "1",
                orderItemId: null,
                productID: "",
                description: "",
                unitType: "",
                unitPrice: 0,
                quantity: 1,
            }]);
        }

        setErrors({});
    }, [order, open]);

    // ── Validation ──────────────────────────────────────────────────
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.clientID) newErrors.clientID = "Company is required";
        if (!formData.expectedDeliveryDate) newErrors.expectedDeliveryDate = "Expected delivery date is required";
        if (productItems.some(i => !i.productID)) newErrors.items = "All product rows must have a product selected";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ── Build payload — matches backend OrderDto exactly ───────────
    const buildPayload = (): CreateOrderDto => {
        const subtotal = productItems.reduce(
            (sum, i) => sum + i.unitPrice * i.quantity, 0
        );

        return {
            orderID: isEdit ? order!.orderID : null,
            orderNo: isEdit ? order!.orderNo : null,
            clientID: formData.clientID,
            quotationID: null,
            orderDate: new Date(formData.orderDate).toISOString(),
            expectedDeliveryDate: new Date(formData.expectedDeliveryDate).toISOString(),
            isDesignByUs: false,
            designingCharge: 0,
            status: isEdit ? order!.status ?? 0 : 0,
            firmID: 1,                                    // adjust from your auth/context
            designStatus: isEdit ? order!.designStatus ?? 0 : 0,
            assignedDesignTo: null,
            enableTax: false,
            taxCategoryID: null,
            isUseBillingAddress: formData.isUseBillingAddress,
            shippingAddress: formData.shippingAddress || null,
            stateID: formData.stateID ? Number(formData.stateID) : null,
            cityID: formData.cityID ? Number(formData.cityID) : null,
            items: productItems.map((i): OrderItemDto => ({
                orderID: isEdit ? order!.orderID : null,
                orderItemId: i.orderItemId,
                productID: i.productID,
                description: i.description || null,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                taxCategoryID: null,
                lineTotal: i.unitPrice * i.quantity,
            })),
        };
    };

    // ── Submit ──────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = buildPayload();
        setIsLoading(true);

        if (isEdit) {
            updateOrder.mutate(
                { id: order!.orderID, data: payload },
                {
                    onSuccess: () => { setIsLoading(false); onSuccess?.(); onClose(); },
                    onError: () => setIsLoading(false),
                }
            );
        } else {
            createOrder.mutate(payload, {
                onSuccess: () => { setIsLoading(false); onSuccess?.(); onClose(); },
                onError: () => setIsLoading(false),
            });
        }
    };

    // ── Product item helpers ────────────────────────────────────────
    const addProductItem = () => {
        setProductItems(prev => [...prev, {
            id: Date.now().toString(),
            orderItemId: null,
            productID: "",
            description: "",
            unitType: "",
            unitPrice: 0,
            quantity: 1,
        }]);
    };

    const removeProductItem = (id: string) => {
        if (productItems.length === 1) return;
        setProductItems(prev => prev.filter(i => i.id !== id));
    };

    const updateItem = <K extends keyof ProductItem>(
        id: string, field: K, value: ProductItem[K]
    ) => {
        setProductItems(prev =>
            prev.map(item => item.id === id ? { ...item, [field]: value } : item)
        );
    };

    // Auto-fill unitType when product is selected — mirrors Quotation pattern
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

    // ── Totals ──────────────────────────────────────────────────────
    const subtotal = productItems.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity, 0
    );

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">

                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {isEdit ? "Edit Order" : "Create New Order"}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Row: Company + Order Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.clientID}
                                onChange={(e) => setFormData({ ...formData, clientID: e.target.value })}
                                disabled={isEdit}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.clientID
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-slate-300 focus:ring-blue-500"
                                    }`}
                            >
                                <option value="">Select Company</option>
                                {(clients as any[]).map((c) => (
                                    <option key={c.clientID} value={c.clientID}>
                                        {c.companyName || "Unknown"}
                                    </option>
                                ))}
                            </select>
                            {errors.clientID && (
                                <p className="text-red-500 text-xs mt-1">{errors.clientID}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Order Date
                            </label>
                            <input
                                type="date"
                                value={formData.orderDate}
                                onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Expected Delivery Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Expected Delivery Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.expectedDeliveryDate}
                            onChange={(e) =>
                                setFormData({ ...formData, expectedDeliveryDate: e.target.value })
                            }
                            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.expectedDeliveryDate
                                ? "border-red-500 focus:ring-red-500"
                                : "border-slate-300 focus:ring-blue-500"
                                }`}
                        />
                        {errors.expectedDeliveryDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.expectedDeliveryDate}</p>
                        )}
                    </div>

                    {/* Use Billing Address toggle */}
                    <div className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">
                            Use Billing Address
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setFormData({
                                    ...formData,
                                    isUseBillingAddress: !formData.isUseBillingAddress,
                                })
                            }
                            className={`relative w-12 h-6 rounded-full transition ${formData.isUseBillingAddress ? "bg-blue-600" : "bg-slate-300"
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition transform shadow-sm ${formData.isUseBillingAddress ? "translate-x-6" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Shipping address + State + City — hidden when using billing address */}
                    {!formData.isUseBillingAddress && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Shipping Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.shippingAddress}
                                    onChange={(e) =>
                                        setFormData({ ...formData, shippingAddress: e.target.value })
                                    }
                                    placeholder="Enter shipping address"
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>

                            {/* State + City side by side */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        State
                                    </label>
                                    <select
                                        value={formData.stateID}
                                        onChange={(e) => handleStateChange(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="">Select State</option>
                                        {(states as any[]).map((s) => (
                                            <option key={s.stateID} value={s.stateID}>
                                                {s.stateName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        City
                                    </label>
                                    <select
                                        value={formData.cityID}
                                        onChange={(e) =>
                                            setFormData({ ...formData, cityID: e.target.value })
                                        }
                                        disabled={!formData.stateID}
                                        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-slate-50 disabled:text-slate-400"
                                    >
                                        <option value="">
                                            {formData.stateID ? "Select City" : "Select state first"}
                                        </option>
                                        {(cities as any[]).map((c) => (
                                            <option key={c.cityID} value={c.cityID}>
                                                {c.cityName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

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

                        {errors.items && (
                            <p className="text-red-500 text-xs mb-2">{errors.items}</p>
                        )}

                        <div className="border border-slate-200 rounded-lg overflow-x-auto">
                            <table className="w-full text-sm min-w-[600px]">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Product</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Description</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Unit</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Unit Price</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Qty</th>
                                        <th className="px-3 py-2 text-center text-xs font-medium text-slate-600 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {productItems.map((item) => (
                                        <tr key={item.id}>
                                            {/* Product dropdown — same pattern as Quotation */}
                                            <td className="px-3 py-2">
                                                <select
                                                    value={item.productID}
                                                    onChange={(e) =>
                                                        handleProductChange(item.id, e.target.value)
                                                    }
                                                    className="w-40 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >
                                                    <option value="">Select</option>
                                                    {(products as ProductDropdown[])?.map((p) => (
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
                                                    onChange={(e) =>
                                                        updateItem(item.id, "description", e.target.value)
                                                    }
                                                    placeholder="Description"
                                                    className="w-36 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>

                                            {/* Unit — read-only, auto-filled from product */}
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
                                                    onChange={(e) =>
                                                        updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)
                                                    }
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
                                                    onChange={(e) =>
                                                        updateItem(item.id, "quantity", parseFloat(e.target.value) || 1)
                                                    }
                                                    placeholder="1"
                                                    className="w-16 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>

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
                            <span className="font-semibold text-slate-800">
                                ₹{subtotal.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-base font-bold border-t border-slate-200 pt-2">
                            <span className="text-slate-900">Grand Total:</span>
                            <span className="text-blue-900">₹{subtotal.toFixed(2)}</span>
                        </div>
                    </div>

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
                                    {isEdit ? "Update" : "Create"} Order
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderUpsertSheet;