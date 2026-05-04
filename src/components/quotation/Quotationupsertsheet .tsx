// src/components/quotations/QuotationUpsertSheet.tsx
import { useState, useEffect } from "react";
import { DatePicker, Select as AntSelect, Divider } from "antd";
import dayjs from "dayjs";
import { X, Save, Loader2, Plus, Trash2, User, Briefcase, Calendar, MapPin, FileText } from "lucide-react";
import { Quotation, TaxCategory, QuotationStatusDropdownItem } from "../../interfaces/quotation.interface";
import { ProductDropdown } from "../../interfaces/product.interface";
import { useClientsDropdown } from "../../hooks/client/useClients";
import { useSettings } from "../../hooks/setting/useSettings";
import { useProductDropdown } from "../../hooks/product/useProductDropdown";
import { useTaxCategories } from "../../hooks/taxCategory/taxCategory";
import { useCreateQuotation, useUpdateQuotation } from "../../hooks/quotation/Usequotationmutations ";
import { usePermissions } from "../../context/PermissionContext";
import { useQuotationStatusDropdown } from "../../hooks/quotation/useQuotations";
import { useLeadDetails } from "../../hooks/lead/useLeadDetails";
import { useAuth } from "../../auth/useAuth";
import ProductQuickAddModal from "../product/ProductQuickAddModal";
import SearchableComboBox from "../common/SearchableComboBox";
import { useStates } from "../../hooks/state/useStates";
import { useCities } from "../../hooks/city/useCities";
import Spinner from "../common/Spinner";
import { toast } from "react-hot-toast";

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

const CLIENT_TYPES = [
    { value: 1, label: "Company" },
    { value: 2, label: "Individual" },
];

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

    const initialFormData = {
        clientID: "",
        leadID: null as string | null,
        quotationDate: dayjs().format("YYYY-MM-DD"),
        validTill: "",
        status: "",
        firmID: 1,
        rejectedNotes: "",
        termsAndConditions: "",
        enableTax: true,

        // Client Fields
        companyName: "",
        contactPerson: "",
        mobile: "",
        email: "",
        gstNo: "",
        billingAddress: "",
        clientType: 1,
        stateID: "" as string,
        cityID: "" as string,
    };

    const [formData, setFormData] = useState(initialFormData);

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
    const statesMutation = useStates();
    const citiesMutation = useCities();

    useEffect(() => {
        if (open) {
            clientsDropdownMutation.mutate(undefined);
            settingsMutation.mutate(undefined);
            productDropdownMutation.mutate(undefined);
            taxCategoriesMutation.mutate(undefined);
            statesMutation.mutate(undefined);
        }
    }, [open]);

    useEffect(() => {
        if (formData.stateID) {
            citiesMutation.mutate(Number(formData.stateID));
        }
    }, [formData.stateID]);

    const clients: any[] = clientsDropdownMutation.data ?? [];
    const settings: any[] = settingsMutation.data ?? [];
    const products: any[] = productDropdownMutation.data ?? [];
    const taxCategories: any[] = taxCategoriesMutation.data ?? [];
    const states: any[] = statesMutation.data ?? [];
    const cities: any[] = citiesMutation.data ?? [];

    const createQuotation = useCreateQuotation();
    const updateQuotation = useUpdateQuotation();

    // Fetch lead details if leadID is provided
    const { data: leadDetails } = useLeadDetails(leadID || null);

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

                companyName: quotation.companyName || "",
                contactPerson: quotation.clientName || "",
                mobile: quotation.mobile || "",
                email: quotation.email || "",
                gstNo: quotation.firmGSTNo || "", // Using firmGSTNo as placeholder if gstNo not in interface yet
                billingAddress: quotation.billAddress || "",
                clientType: 1, // Defaulting to company for now
                stateID: "",
                cityID: "",
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
                            unitType: matchedProduct?.unitName || "",
                        };
                    })
                );
            }
        } else {
            // CREATE MODE
            const validTill = new Date();
            validTill.setDate(validTill.getDate() + 15);

            const sentStatus = (statusData as QuotationStatusDropdownItem[]).find(s => s.statusName === "Sent");

            setFormData(prev => ({
                ...prev,
                clientID: clientID || "",
                leadID: leadID || null,
                quotationDate: dayjs().format("YYYY-MM-DD"),
                validTill: dayjs(validTill).format("YYYY-MM-DD"),
                status: sentStatus?.quotationStatusID || "",
                firmID: 1,
                rejectedNotes: "",
                enableTax: true,

                // Pre-fill from leadDetails if available
                companyName: leadDetails?.companyName || "",
                contactPerson: leadDetails?.contactPerson || "",
                mobile: leadDetails?.mobile || "",
                email: leadDetails?.email || "",
                gstNo: leadDetails?.gstNo || "",
                billingAddress: leadDetails?.billingAddress || "",
                clientType: leadDetails?.clientType || 1,
                stateID: leadDetails?.stateID?.toString() || "",
                cityID: leadDetails?.cityID?.toString() || "",
            }));

            if (clientID) {
                // If clientID is provided, prefill client info if possible
                const client = clients.find(c => c.clientID === clientID);
                if (client) {
                    onCustomerSelect(clientID);
                }
            }

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
    }, [quotation, open, leadID, clientID, statusData, leadDetails]);

    const onCustomerSelect = (selectedClientId: string | null) => {
        if (selectedClientId) {
            const customer = clients.find((c: any) => c.clientID === selectedClientId);
            if (customer) {
                setFormData(prev => ({
                    ...prev,
                    clientID: selectedClientId,
                    companyName: customer.companyName || "",
                    contactPerson: customer.contactPerson || "",
                    email: customer.email || "",
                    mobile: customer.mobileNumber || "",
                    gstNo: customer.gstNo || "",
                    billingAddress: customer.billAddress || "",
                    stateID: customer.stateID?.toString() ?? "",
                    cityID: customer.cityID?.toString() ?? "",
                    clientType: customer.clientType || 1,
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                clientID: "",
                companyName: "",
                contactPerson: "",
                email: "",
                mobile: "",
                gstNo: "",
                billingAddress: "",
                stateID: "",
                cityID: "",
            }));
        }
    };

    // ---------- Validation ----------
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.contactPerson) newErrors.contactPerson = "Contact Person is required";
        if (!formData.mobile) newErrors.mobile = "Mobile is required";
        if (!formData.email) newErrors.email = "Email is required";
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
            clientID: formData.clientID || null,
            leadID: formData.leadID,
            quotationDate: dayjs(formData.quotationDate).format("YYYY-MM-DDTHH:mm:ss"),
            validTill: dayjs(formData.validTill).format("YYYY-MM-DDTHH:mm:ss"),
            status: formData.status != "" ? formData.status : null,
            firmID: formData.firmID,
            rejectedNotes: formData.rejectedNotes,
            termsAndConditions: formData.termsAndConditions,
            enableTax: formData.enableTax,
            
            // Client Fields
            companyName: formData.companyName,
            contactPerson: formData.contactPerson,
            mobile: formData.mobile,
            email: formData.email,
            gstNo: formData.gstNo,
            billingAddress: formData.billingAddress,
            clientType: formData.clientType,
            stateID: formData.stateID ? Number(formData.stateID) : null,
            cityID: formData.cityID ? Number(formData.cityID) : null,

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
                        description: selected.description || "",
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
                            description: "",
                            unitType: newProduct.unitName != null ? String(newProduct.unitName) : "",
                            unitPrice: 0,
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

    const isClientReadOnly = !!formData.clientID || !!formData.leadID;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh]">
                
                {/* ── HEADER ── */}
                <div className="px-6 py-4 border-b bg-white flex items-center justify-between shrink-0 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[var(--btn-primary)]">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-800">
                                {isEdit ? "Edit Quotation" : "Create New Quotation"}
                            </h2>
                            <p className="text-xs text-slate-400">
                                {isEdit ? "Update quotation details" : "Fill in the details to generate a quotation"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── BODY ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    
                    {/* ── SECTION: Client Information ── */}
                    <Section icon={<User className="w-3.5 h-3.5" />} title="Client Information" cols={3}>
                        <div className="col-span-3">
                            <SearchableComboBox
                                label="Customer"
                                items={clients.map((c) => ({
                                    value: c.clientID,
                                    label: `${c.contactPerson} - ${c.email ?? ""}`,
                                }))}
                                value={formData.clientID}
                                onSelect={(item: any) => onCustomerSelect(item?.value ?? null)}
                                disabled={isEdit}
                            />
                        </div>

                        <Input
                            label="Contact Person"
                            required
                            value={formData.contactPerson}
                            error={errors.contactPerson}
                            onChange={(v: any) => setFormData({ ...formData, contactPerson: v })}
                            disabled={isClientReadOnly}
                        />
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Customer Type</label>
                            <AntSelect
                                showSearch
                                className="w-full h-10"
                                value={formData.clientType}
                                onChange={(val) => setFormData({ ...formData, clientType: val })}
                                optionFilterProp="children"
                                disabled={isClientReadOnly}
                            >
                                {CLIENT_TYPES.map((t) => (
                                    <AntSelect.Option key={t.value} value={t.value}>{t.label}</AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>

                        {formData.clientType === 1 && (
                            <>
                                <Input
                                    label="Company Name"
                                    value={formData.companyName}
                                    onChange={(v: any) => setFormData({ ...formData, companyName: v })}
                                    disabled={isClientReadOnly}
                                />
                                <Input
                                    label="GST No"
                                    value={formData.gstNo}
                                    onChange={(v: any) => setFormData({ ...formData, gstNo: v })}
                                    disabled={isClientReadOnly}
                                />
                            </>
                        )}

                        <Input
                            label="Mobile"
                            required
                            value={formData.mobile}
                            error={errors.mobile}
                            onChange={(v: any) => setFormData({ ...formData, mobile: v.replace(/[^0-9]/g, "").slice(0, 10) })}
                            disabled={isClientReadOnly}
                        />
                        <Input
                            label="Email"
                            required
                            value={formData.email}
                            error={errors.email}
                            onChange={(v: any) => setFormData({ ...formData, email: v })}
                            disabled={isClientReadOnly}
                        />
                    </Section>

                    {/* ── SECTION: Location ── */}
                    <Section icon={<MapPin className="w-3.5 h-3.5" />} title="Location">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">State</label>
                            <AntSelect
                                showSearch
                                className="w-full h-10"
                                value={formData.stateID || undefined}
                                onChange={(val) => setFormData({ ...formData, stateID: val, cityID: "" })}
                                placeholder="Select State"
                                optionFilterProp="children"
                                disabled={isClientReadOnly}
                            >
                                {(states as any[]).map((s) => (
                                    <AntSelect.Option key={s.stateID} value={String(s.stateID)}>{s.stateName}</AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">City</label>
                            <AntSelect
                                showSearch
                                className="w-full h-10"
                                value={formData.cityID || undefined}
                                disabled={!formData.stateID || isClientReadOnly}
                                onChange={(val) => setFormData({ ...formData, cityID: val })}
                                placeholder={formData.stateID ? "Select City" : "Select state first"}
                                optionFilterProp="children"
                            >
                                {(cities as any[]).map((c) => (
                                    <AntSelect.Option key={c.cityID} value={String(c.cityID)}>{c.cityName}</AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>
                        <div className="col-span-2">
                            <Textarea
                                label="Billing Address"
                                value={formData.billingAddress}
                                onChange={(v: any) => setFormData({ ...formData, billingAddress: v })}
                                disabled={isClientReadOnly}
                            />
                        </div>
                    </Section>

                    {/* ── SECTION: Quotation Details ── */}
                    <Section icon={<Briefcase className="w-3.5 h-3.5" />} title="Quotation Details">
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Quotation Date</label>
                            <div className="h-10 px-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center text-slate-500 text-sm">
                                {formData.quotationDate ? dayjs(formData.quotationDate).format("DD/MM/YYYY") : "-"}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                                Valid Till <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                className={`w-full h-10 rounded-lg ${errors.validTill ? "border-red-500" : "border-slate-200"}`}
                                format="YYYY-MM-DD"
                                placeholder="Select date"
                                value={formData.validTill ? dayjs(formData.validTill) : null}
                                onChange={(date, dateString) =>
                                    setFormData({ ...formData, validTill: Array.isArray(dateString) ? dateString[0] : dateString })
                                }
                                disabledDate={(current) => current && current < dayjs(formData.quotationDate).startOf("day")}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Status</label>
                            <AntSelect
                                showSearch
                                value={formData.status || undefined}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                                className="w-full h-10"
                                placeholder={isEdit ? "Select Status" : "Sent"}
                                optionFilterProp="children"
                                disabled={!isEdit}
                            >
                                {(statusData as QuotationStatusDropdownItem[]).map((o) => (
                                    <AntSelect.Option key={o.quotationStatusID} value={o.quotationStatusID}>
                                        {o.statusName}
                                    </AntSelect.Option>
                                ))}
                            </AntSelect>
                        </div>
                        
                        <div>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">Tax</label>
                            <div className="flex items-center justify-between h-10 px-3 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-xs font-semibold text-slate-600">Enable Tax</span>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, enableTax: !formData.enableTax })}
                                    className={`relative w-10 h-5 rounded-full transition ${formData.enableTax ? "bg-[var(--btn-primary)]" : "bg-slate-300"}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition transform shadow-sm ${formData.enableTax ? "translate-x-5" : "translate-x-0"}`} />
                                </button>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <Textarea
                                label="Terms and Conditions"
                                value={formData.termsAndConditions}
                                onChange={(v: any) => setFormData({ ...formData, termsAndConditions: v })}
                                rows={2}
                            />
                        </div>

                        {/* Rejected Notes */}
                        {isEdit && formData.status === (statusData as QuotationStatusDropdownItem[]).find(s => s.statusName === "Rejected")?.quotationStatusID && (
                            <div className="col-span-2">
                                <Textarea
                                    label="Rejected Notes"
                                    value={formData.rejectedNotes}
                                    onChange={(v: any) => setFormData({ ...formData, rejectedNotes: v })}
                                    placeholder="Reason for rejection..."
                                />
                            </div>
                        )}
                    </Section>

                    {/* ── SECTION: Product Items ── */}
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
                                <Plus size={14} /> Add Product
                            </button>
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
                                        <th className="px-3 py-2 w-10"></th>
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
                                                    step="any"
                                                    value={item.unitPrice || ""}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        updateItem(item.id, "unitPrice", Number(val.toFixed(2)));
                                                    }}
                                                    placeholder="0.00"
                                                    className="w-24 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>

                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity || ""}
                                                    onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 1)}
                                                    placeholder="1"
                                                    className="w-16 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </td>
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
                                                                {t.taxName} 
                                                            </AntSelect.Option>
                                                        ))}
                                                    </AntSelect>
                                                </td>
                                            )}
                                            <td className="px-3 py-2 text-slate-700 font-medium whitespace-nowrap">
                                                ₹{(item.unitPrice * item.quantity).toFixed(2)}
                                            </td>
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

                    {/* Totals Section */}
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
                </div>

                {/* ── FOOTER ── */}
                <div className="px-6 py-4 border-t bg-slate-50 flex gap-3 shrink-0 rounded-b-2xl">
                    <button
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isLoading}
                        className="flex-1 btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                        onClick={handleSubmit}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? "Update Quotation" : "Create Quotation"}
                    </button>
                </div>
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

/* ================= HELPERS ================= */

const Section = ({ icon, title, children, cols = 2 }: { icon: React.ReactNode; title: string; children: React.ReactNode; cols?: number }) => (
    <div>
        <div className="flex items-center gap-2 mb-3">
            <span className="text-[var(--btn-primary)]">{icon}</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-${cols === 3 ? '3' : '2'} gap-x-4 gap-y-3`}>
            {children}
        </div>
    </div>
);

const Input = ({ label, required, value, error, onChange, type = "text", disabled }: any) => (
    <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            className={`input w-full h-10 px-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none ${error ? "border-red-400" : ""} disabled:bg-slate-50 disabled:text-slate-500`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        />
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
);

const Textarea = ({ label, required, value, error, onChange, disabled, rows = 3 }: any) => (
    <div>
        <label className="text-xs font-semibold text-slate-600 mb-1 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
            rows={rows}
            className={`input w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none disabled:bg-slate-50 disabled:text-slate-500 ${error ? "border-red-400" : ""}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        />
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
);
