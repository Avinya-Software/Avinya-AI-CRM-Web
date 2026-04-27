// src/components/order/OrderUpsertSheet.tsx
import { useState, useEffect } from "react";
import { DatePicker, Select as AntSelect, Divider } from "antd";
import dayjs from "dayjs";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import type { Order, CreateOrderDto, OrderItemDto } from "../../interfaces/order.interface";
import { ProductDropdown } from "../../interfaces/product.interface";
import { useClientsDropdown } from "../../hooks/client/useClients";
import { useProductDropdown } from "../../hooks/product/useProductDropdown";
import { useCreateOrder, useDesignStatusDropdown, useOrderStatusDropdown, useUpdateOrder } from "../../hooks/order/useOrders";
import { useCities } from "../../hooks/city/useCities";
import { useStates } from "../../hooks/state/useStates";
import { usePermissions } from "../../context/PermissionContext";
import { useTaxCategories } from "../../hooks/taxCategory/taxCategory";
import { TaxCategory } from "../../interfaces/quotation.interface";
import ProductQuickAddModal from "../product/ProductQuickAddModal";


interface OrderUpsertSheetProps {
    open: boolean;
    onClose: () => void;
    order?: Order | null;
    sourceQuotation?: any | null;
    onSuccess?: () => void;
}

interface ProductItem {
    id: string;
    orderItemId: string | null;
    productID: string;
    description: string;
    unitType: string;
    unitPrice: number;
    quantity: number;
    taxCategoryID: string;
}


const OrderUpsertSheet = ({
    open,
    onClose,
    order = null,
    sourceQuotation = null,
    onSuccess,
}: OrderUpsertSheetProps) => {
    const isEdit = !!order;

    const { hasPermission } = usePermissions();
    const canAdd = hasPermission("order", "add");
    const canEdit = hasPermission("order", "edit");

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        clientID: "",
        orderDate: dayjs().format("YYYY-MM-DD"),
        expectedDeliveryDate: "",
        isUseBillingAddress: false,
        shippingAddress: "",
        stateID: "" as string,
        cityID: "" as string,
        orderStatusID: "",
        designStatusID: "",
        enableTax: false,
        taxCategoryID: "" as string,
    });


    const [productItems, setProductItems] = useState<ProductItem[]>([{
        id: "1",
        orderItemId: null,
        productID: "",
        description: "",
        unitType: "",
        unitPrice: 0,
        quantity: 1,
        taxCategoryID: "",
    }]);


    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [activeRowId, setActiveRowId] = useState<string | null>(null);

    const clientsDropdownMutation = useClientsDropdown();
    const productDropdownMutation = useProductDropdown();
    const statesMutation = useStates();
    const citiesMutation = useCities();
    const orderStatusDropdownMutation = useOrderStatusDropdown();
    const designStatusDropdownMutation = useDesignStatusDropdown();
    const taxCategoriesMutation = useTaxCategories();

    useEffect(() => {
        if (open) {
            clientsDropdownMutation.mutate(undefined);
            productDropdownMutation.mutate(undefined);
            statesMutation.mutate(undefined);
            orderStatusDropdownMutation.mutate(undefined);
            designStatusDropdownMutation.mutate(undefined);
            taxCategoriesMutation.mutate(undefined);
        }
    }, [open]);

    useEffect(() => {
        if (formData.stateID) {
            citiesMutation.mutate(Number(formData.stateID));
        }
    }, [formData.stateID]);

    const clients: any[] = clientsDropdownMutation.data ?? [];
    const products: any[] = productDropdownMutation.data ?? [];
    const states: any[] = statesMutation.data ?? [];
    const cities: any[] = citiesMutation.data ?? [];
    const orderStatusData: any[] = orderStatusDropdownMutation.data ?? [];
    const designStatusData: any[] = designStatusDropdownMutation.data ?? [];
    const taxCategories: any[] = taxCategoriesMutation.data ?? [];
    const createOrder = useCreateOrder();
    const updateOrder = useUpdateOrder();


    const handleStateChange = (stateID: string) => {
        setFormData(prev => ({ ...prev, stateID, cityID: "" }));
    };

    useEffect(() => {
        if (!open) return;
        if (order) {
            const sourceItems = order.orderItems ?? (order as any).items ?? [];
            setFormData({
                clientID: order.clientID || "",
                orderDate: order.orderDate
                    ? dayjs(order.orderDate).format("YYYY-MM-DD")
                    : dayjs().format("YYYY-MM-DD"),
                expectedDeliveryDate: order.expectedDeliveryDate
                    ? dayjs(order.expectedDeliveryDate).format("YYYY-MM-DD")
                    : "",
                isUseBillingAddress: order.isUseBillingAddress ?? false,
                shippingAddress: order.shippingAddress || "",
                stateID: order.stateID != null ? String(order.stateID) : "",
                cityID: order.cityID != null ? String(order.cityID) : "",
                orderStatusID: order.status ? String(order.status) : "",
                designStatusID: order.status ? String(order.status) : "",
                enableTax: order.enableTax ?? false,
                taxCategoryID: order.taxCategoryID || "",
            });


            setProductItems(
                sourceItems.length > 0
                    ? sourceItems.map((item: any, idx: number) => {
                        const matchedProduct = products.find(p => p.productID === item.productID);

                        return {
                            id: String(idx + 1),
                            orderItemId: item.orderItemID || null,
                            productID: item.productID || "",
                            description: item.description || "",
                            unitType: matchedProduct?.unitName || "", // ✅ lookup here
                            unitPrice: item.unitPrice || 0,
                            quantity: item.quantity || 1,
                            taxCategoryID: item.taxCategoryID || "",
                        };

                    })
                    : [{
                        id: "1",
                        orderItemId: null,
                        productID: "",
                        description: "",
                        unitName: "",
                        unitPrice: 0,
                        quantity: 1,
                        taxCategoryID: ""
                    }]

            );

        } else if (sourceQuotation) {
            const delivery = new Date();
            delivery.setDate(delivery.getDate() + 15);

            setFormData({
                clientID: sourceQuotation.clientID || "",
                orderDate: dayjs().format("YYYY-MM-DD"),
                expectedDeliveryDate: dayjs(delivery).format("YYYY-MM-DD"),
                isUseBillingAddress: false,
                shippingAddress: "",
                stateID: "",
                cityID: "",
                designStatusID: "",
                orderStatusID: "",
                enableTax: sourceQuotation.enableTax ?? false,
                taxCategoryID: sourceQuotation.taxCategoryID || "",
            });


            const quotationItems = sourceQuotation.quotationItems
                ?? sourceQuotation.items
                ?? sourceQuotation.products
                ?? [];

            setProductItems(
                quotationItems.length > 0
                    ? quotationItems.map((item: any, idx: number) => ({
                        id: String(idx + 1),
                        orderItemId: null,
                        productID: item.productID || "",
                        description: item.description || "",
                        unitType: item.unitType || item.unitName || "",
                        unitPrice: item.unitPrice || item.rate || 0,
                        quantity: item.quantity || 1,
                        taxCategoryID: item.taxCategoryID || "",
                    }))
                    : [{ id: "1", orderItemId: null, productID: "", description: "", unitType: "", unitPrice: 0, quantity: 1, taxCategoryID: "" }]

            );

        } else {
            const delivery = new Date();
            delivery.setDate(delivery.getDate() + 15);

            setFormData({
                clientID: "",
                orderDate: dayjs().format("YYYY-MM-DD"),
                expectedDeliveryDate: dayjs(delivery).format("YYYY-MM-DD"),
                isUseBillingAddress: false,
                shippingAddress: "",
                stateID: "",
                cityID: "",
                designStatusID: "",
                orderStatusID: "",
                enableTax: false,
                taxCategoryID: "",
            });


            setProductItems([{
                id: "1", orderItemId: null, productID: "",
                description: "", unitType: "", unitPrice: 0, quantity: 1,
                taxCategoryID: "",
            }]);

        }

        setErrors({});
    }, [order, sourceQuotation, open]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.clientID) newErrors.clientID = "Company is required";
        if (!formData.expectedDeliveryDate) newErrors.expectedDeliveryDate = "Expected delivery date is required";
        if (!formData.isUseBillingAddress && !formData.shippingAddress.trim()) {
            newErrors.shippingAddress = "Shipping address is required";
        }
        
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

    const buildPayload = (): CreateOrderDto => ({
        orderID: isEdit ? order!.orderID : null,
        orderNo: isEdit ? order!.orderNo : null,
        clientID: formData.clientID,
        quotationID: sourceQuotation?.quotationID ?? (isEdit ? order!.quotationID : null) ?? null,
        orderDate: dayjs(formData.orderDate).format("YYYY-MM-DDTHH:mm:ss"),
        expectedDeliveryDate: dayjs(formData.expectedDeliveryDate).format("YYYY-MM-DDTHH:mm:ss"),
        isDesignByUs: false,
        designingCharge: 0,
        status: Number(formData.orderStatusID != "" ? formData.orderStatusID : (isEdit ? order!.status : 1) ?? 1),
        firmID: sourceQuotation?.firmID ?? 1,
        designStatus: Number(formData.designStatusID),
        assignedDesignTo: null,
        enableTax: formData.enableTax,
        taxCategoryID: formData.taxCategoryID || null,
        isUseBillingAddress: formData.isUseBillingAddress,

        shippingAddress: formData.shippingAddress || null,
        stateID: formData.stateID ? Number(formData.stateID) : null,
        cityID: formData.cityID ? Number(formData.cityID) : null,
        items: productItems.map((i): OrderItemDto => ({
            orderItemId: i.orderItemId,
            productID: i.productID,
            description: i.description || null,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            taxCategoryID: i.taxCategoryID || null,
            lineTotal: i.unitPrice * i.quantity,
        })),

    });

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

    const addProductItem = () => {
        setProductItems(prev => [{
            id: Date.now().toString(), orderItemId: null,
            productID: "", description: "", unitType: "", unitPrice: 0, quantity: 1,
            taxCategoryID: formData.taxCategoryID,
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

    const subtotal = productItems.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const totalTax = formData.enableTax
        ? productItems.reduce((sum, i) => {
            const cat = (taxCategories as TaxCategory[]).find(t => t.taxCategoryID === i.taxCategoryID);
            const pct = cat?.rate ?? 0;
            return sum + (i.unitPrice * i.quantity * pct) / 100;
        }, 0)
        : 0;
    const grandTotal = subtotal + totalTax;


    // Guard: if no relevant permission, don't render the sheet
    if (!open) return null;
    if (isEdit && !canEdit) return null;
    if (!isEdit && !canAdd) return null;

    const isFormReadOnly = isEdit ? !canEdit : !canAdd;

    const title = isEdit
        ? "Edit Order"
        : sourceQuotation
            ? `Create Order from ${sourceQuotation.quotationNo ?? "Quotation"}`
            : "Create New Order";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">

                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                        {sourceQuotation && (
                            <p className="text-xs text-slate-500 mt-0.5">
                                Client: {sourceQuotation.companyName || sourceQuotation.clientName}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                    {/* Company + Order Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <AntSelect
                                showSearch
                                value={formData.clientID || undefined}
                                onChange={(val) => setFormData({ ...formData, clientID: val })}
                                disabled={isEdit || !!sourceQuotation || isFormReadOnly}
                                className={`w-full h-10 ${errors.clientID ? "ant-select-error" : ""}`}
                                placeholder="Select Company"
                                optionFilterProp="children"
                            >
                                {(clients as any[]).map((c) => (
                                    <AntSelect.Option key={c.clientID} value={c.clientID}>
                                        {c.companyName || "Unknown"}
                                    </AntSelect.Option>
                                ))}
                            </AntSelect>
                            {errors.clientID && <p className="text-red-500 text-xs mt-1">{errors.clientID}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Order Date</label>
                            <DatePicker
                                className="w-full h-10 border-slate-300 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
                                format="YYYY-MM-DD"
                                placeholder="Select order date"
                                value={formData.orderDate ? dayjs(formData.orderDate) : null}
                                onChange={(date, dateString) =>
                                    setFormData({ ...formData, orderDate: Array.isArray(dateString) ? dateString[0] : dateString })
                                }
                                disabled={isFormReadOnly}
                            />
                        </div>
                    </div>

                    {/* Expected Delivery Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Expected Delivery Date <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            className={`w-full h-10 rounded-lg ${errors.expectedDeliveryDate ? "border-red-500" : "border-slate-300"} disabled:bg-slate-50 disabled:text-slate-500`}
                            format="YYYY-MM-DD"
                            placeholder="Select delivery date"
                            value={formData.expectedDeliveryDate ? dayjs(formData.expectedDeliveryDate) : null}
                            onChange={(date, dateString) =>
                                setFormData({ ...formData, expectedDeliveryDate: Array.isArray(dateString) ? dateString[0] : dateString })
                            }
                            disabled={isFormReadOnly}
                        />
                        {errors.expectedDeliveryDate && <p className="text-red-500 text-xs mt-1">{errors.expectedDeliveryDate}</p>}
                    </div>

                    {/* Enable Tax Toggle */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-700">Enable Tax</span>
                            <button
                                type="button"
                                disabled={isFormReadOnly}
                                onClick={() => setFormData({ ...formData, enableTax: !formData.enableTax })}
                                className={`relative w-12 h-6 rounded-full transition disabled:opacity-50 ${formData.enableTax ? "bg-[var(--btn-primary)]" : "bg-slate-300"}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition transform shadow-sm ${formData.enableTax ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>
                        {/* Use Billing Address toggle */}

                        <div className="flex items-center justify-between py-2 px-4 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-700">Use Billing Address</span>
                            <button
                                type="button"
                                disabled={isFormReadOnly}
                                onClick={() => setFormData({ ...formData, isUseBillingAddress: !formData.isUseBillingAddress })}
                                className={`relative w-12 h-6 rounded-full transition disabled:opacity-50 ${formData.isUseBillingAddress ? "bg-[var(--btn-primary)]" : "bg-slate-300"}`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition transform shadow-sm ${formData.isUseBillingAddress ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>



                    {/* Shipping address + State + City */}
                    {!formData.isUseBillingAddress && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Shipping Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.shippingAddress}
                                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                    placeholder="Enter shipping address"
                                    disabled={isFormReadOnly}
                                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${errors.shippingAddress
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-slate-300 focus:ring-blue-500"
                                        } disabled:bg-slate-50 disabled:text-slate-500`}
                                />
                                {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                                    <AntSelect
                                        showSearch
                                        value={formData.stateID || undefined}
                                        onChange={(val) => handleStateChange(val)}
                                        disabled={isFormReadOnly}
                                        className="w-full h-10"
                                        placeholder="Select State"
                                        optionFilterProp="children"
                                    >
                                        {(states as any[]).map((s) => (
                                            <AntSelect.Option key={s.stateID} value={String(s.stateID)}>{s.stateName}</AntSelect.Option>
                                        ))}
                                    </AntSelect>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                                    <AntSelect
                                        showSearch
                                        value={formData.cityID || undefined}
                                        onChange={(val) => setFormData({ ...formData, cityID: val })}
                                        disabled={!formData.stateID || isFormReadOnly}
                                        className="w-full h-10"
                                        placeholder={formData.stateID ? "Select City" : "Select state first"}
                                        optionFilterProp="children"
                                    >
                                        {(cities as any[]).map((c) => (
                                            <AntSelect.Option key={c.cityID} value={String(c.cityID)}>{c.cityName}</AntSelect.Option>
                                        ))}
                                    </AntSelect>
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
                            {!isFormReadOnly && (
                                <button
                                    type="button"
                                    onClick={addProductItem}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 btn-primary rounded-lg text-xs font-medium transition"
                                >
                                    <Plus size={14} /> Add Product
                                </button>
                            )}
                        </div>

                        {errors.items && <p className="text-red-500 text-xs mb-2">{errors.items}</p>}

                        <div className="border border-slate-200 rounded-lg overflow-x-auto">
                            <table className="w-full text-sm min-w-[600px]">
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
                                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-600">Total</th>

                                        {!isFormReadOnly && <th className="px-3 py-2 w-10"></th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {productItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2">
                                                <AntSelect
                                                    showSearch
                                                    value={item.productID || undefined}
                                                    onChange={(val) => handleProductChange(item.id, val)}
                                                    disabled={isFormReadOnly}
                                                    className="w-40 h-9"
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
                                                    {(products as ProductDropdown[])?.map((p) => (
                                                        <AntSelect.Option key={p.productID} value={p.productID}>{p.productName}</AntSelect.Option>
                                                    ))}
                                                </AntSelect>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    value={item.description}
                                                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                                    placeholder="Description"
                                                    readOnly={isFormReadOnly}
                                                    className="w-36 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    value={item.unitType}
                                                    readOnly
                                                    className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-sm text-slate-500"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={item.unitPrice || ""}
                                                    onChange={(e) => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    readOnly={isFormReadOnly}
                                                    className="w-24 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 read-only:bg-slate-50 read-only:text-slate-500"
                                                />
                                            </td>

                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity || ""}
                                                    onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 1)}
                                                    placeholder="1"
                                                    readOnly={isFormReadOnly}
                                                    className="w-16 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 read-only:bg-slate-50 read-only:text-slate-500"
                                                />
                                            </td>
                                            {formData.enableTax && (
                                                <td className="px-3 py-2">
                                                    <AntSelect
                                                        showSearch
                                                        value={item.taxCategoryID || undefined}
                                                        onChange={(val) => updateItem(item.id, "taxCategoryID", val)}
                                                        disabled={isFormReadOnly}
                                                        className="w-36 h-9"
                                                        placeholder="No Tax"
                                                        allowClear
                                                        optionFilterProp="children"
                                                    >
                                                        {(taxCategories as TaxCategory[])?.map(t => (
                                                            <AntSelect.Option key={t.taxCategoryID} value={t.taxCategoryID}>
                                                                {t.taxName} 
                                                            </AntSelect.Option>
                                                        ))}
                                                    </AntSelect>
                                                </td>
                                            )}
                                            <td className="px-3 py-2 text-slate-700 font-medium whitespace-nowrap">
                                                ₹{(item.unitPrice * item.quantity).toFixed(2)}
                                            </td>
                                            {!isFormReadOnly && (
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
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {isEdit && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Order Status <span className="text-red-500">*</span>
                                </label>
                                <AntSelect
                                    showSearch
                                    value={formData.orderStatusID || undefined}
                                    onChange={(val) => setFormData({ ...formData, orderStatusID: val })}
                                    className={`w-full h-10 ${errors.orderStatusID ? "ant-select-error" : ""}`}
                                    placeholder="Select Order Status"
                                    optionFilterProp="children"
                                >
                                    {(orderStatusData as any[]).map((o) => (
                                        <AntSelect.Option key={o.statusID} value={String(o.statusID)}>
                                            {o.statusName || "Unknown"}
                                        </AntSelect.Option>
                                    ))}
                                </AntSelect>
                                {errors.designStatusID && <p className="text-red-500 text-xs mt-1">{errors.designStatusID}</p>}
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Design Status <span className="text-red-500">*</span>
                                </label>
                                <AntSelect
                                    showSearch
                                    value={formData.designStatusID || undefined}
                                    onChange={(val) => setFormData({ ...formData, designStatusID: val })}
                                    className={`w-full h-10 ${errors.designStatusID ? "ant-select-error" : ""}`}
                                    placeholder="Select Design Status"
                                    optionFilterProp="children"
                                >
                                    {(designStatusData as any[]).map((o) => (
                                        <AntSelect.Option key={o.designStatusID} value={String(o.designStatusID)}>
                                            {o.designStatusName || "Unknown"}
                                        </AntSelect.Option>
                                    ))}
                                </AntSelect>
                                {errors.designStatusID && <p className="text-red-500 text-xs mt-1">{errors.designStatusID}</p>}
                            </div>
                        </div>
                    )}

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

                        {/* Only show Save/Update if user has the right permission */}
                        {!isFormReadOnly && (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 btn-primary rounded-lg transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                ) : (
                                    <><Save size={16} /> {isEdit ? "Update" : "Create"} Order</>
                                )}
                            </button>
                        )}
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

export default OrderUpsertSheet;