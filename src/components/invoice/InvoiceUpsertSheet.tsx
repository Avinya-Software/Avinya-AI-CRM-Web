// src/components/invoice/InvoiceUpsertSheet.tsx
import { useState, useEffect } from "react";
import { X, Save, Loader2, PackageOpen } from "lucide-react";
import { Invoice, CreateInvoiceDto, InvoiceItem } from "../../interfaces/invoice.interface";
import { Order } from "../../interfaces/order.interface";
import { useCreateInvoice, useUpdateInvoice, useInvoiceStatusDropdown } from "../../hooks/invoice/useInvoices";
import { useTaxCategories } from "../../hooks/taxCategory/taxCategory";
import { TaxCategory } from "../../interfaces/quotation.interface";
import { toast } from "react-hot-toast";


interface InvoiceUpsertSheetProps {
    open: boolean;
    onClose: () => void;
    invoice?: Invoice | null;
    sourceOrder?: Order | null;
    onSuccess?: () => void;
}

interface ItemForm {
    id: string;
    productID: string;
    productName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxCategoryID: string;
}

const InvoiceUpsertSheet = ({
    open,
    onClose,
    invoice = null,
    sourceOrder = null,
    onSuccess,
}: InvoiceUpsertSheetProps) => {
    const isEdit = !!invoice;
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        clientID: "",
        invoiceDate: new Date().toISOString().substring(0, 10),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        invoiceStatusID: 0,
        discount: 0,
        placeOfSupply: "",
        reverseCharge: false,
        grrrNo: "",
        transport: "",
        vehicleNo: "",
        station: "",
        eWayBillNo: "",
        notes: "",
        termsAndConditions: "",
    });


    const [items, setItems] = useState<ItemForm[]>([]);

    const createInvoice = useCreateInvoice();
    const updateInvoice = useUpdateInvoice();
    const { data: taxCategories = [] } = useTaxCategories();
    const { data: statusDropdown = [] } = useInvoiceStatusDropdown();

    // Resolve the Pending status ID from the backend dropdown, fallback to 1
    const pendingStatusID: number = (statusDropdown as any[]).find(
        (s) => (s.statusName || s.invoiceStatusName || "").toLowerCase().includes("pending")
    )?.invoiceStatusID ?? 1;


    useEffect(() => {
        if (!open) return;

        if (invoice) {
            setFormData({
                clientID: invoice.clientID,
                invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().substring(0, 10) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
                invoiceStatusID: invoice.invoiceStatusID || pendingStatusID,

                discount: invoice.discount || 0,
                placeOfSupply: invoice.placeOfSupply || "",
                reverseCharge: invoice.reverseCharge || false,
                grrrNo: invoice.grrrNo || "",
                transport: invoice.transport || "",
                vehicleNo: invoice.vehicleNo || "",
                station: invoice.station || "",
                eWayBillNo: invoice.eWayBillNo || "",
                notes: invoice.notes || "",
                termsAndConditions: invoice.termsAndConditions || "",
            });

            const invoiceItems = invoice.items || invoice.orderItems || [];
            setItems(invoiceItems.map((item: any, idx: number) => ({
                id: String(idx + 1),
                productID: item.productID || "",
                productName: item.productName || "",
                description: item.description || "",
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                taxCategoryID: item.taxCategoryID || "",
            })));
        } else if (sourceOrder) {
            setFormData({
                clientID: sourceOrder.clientID || "",
                invoiceDate: new Date().toISOString().substring(0, 10),
                dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
                invoiceStatusID: pendingStatusID,

                discount: 0,
                placeOfSupply: "",
                reverseCharge: false,
                grrrNo: "",
                transport: "",
                vehicleNo: "",
                station: "",
                eWayBillNo: "",
                notes: `Generated from Order ${sourceOrder.orderNo}`,
                termsAndConditions: "",
            });

            const sourceItems = sourceOrder.orderItems || [];
            setItems(sourceItems.map((item, idx) => ({
                id: String(idx + 1),
                productID: item.productID || "",
                productName: item.productName || "",
                description: item.description || "",
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
                taxCategoryID: item.taxCategoryID || "",
            })));
        }
    }, [open, invoice, sourceOrder]);

    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const taxes = items.reduce((sum, i) => {
        const cat = (taxCategories as TaxCategory[]).find(t => t.taxCategoryID === i.taxCategoryID);
        const pct = cat?.rate ?? 0;
        return sum + (i.unitPrice * i.quantity * pct) / 100;
    }, 0);
    const grandTotal = subtotal + taxes - (Number(formData.discount) || 0);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload: any = {
            ...formData,
            subTotal: subtotal,
            taxes: taxes,
            grandTotal: subtotal + taxes, // API takes grand total without discount subtraction
            orderID: sourceOrder?.orderID || invoice?.orderID || null,
        };



        if (isEdit) {
            payload.invoiceID = invoice.invoiceID;
            updateInvoice.mutate(payload, {
                onSuccess: () => { setIsLoading(false); onSuccess?.(); onClose(); },
                onError: () => setIsLoading(false),
            });
        } else {
            createInvoice.mutate(payload, {
                onSuccess: () => { setIsLoading(false); onSuccess?.(); onClose(); },
                onError: () => setIsLoading(false),
            });
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {isEdit ? "Edit Invoice" : sourceOrder ? `Create Invoice for Order ${sourceOrder.orderNo}` : "Create Invoice"}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Invoice Date</label>
                            <input
                                type="date"
                                value={formData.invoiceDate}
                                onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                required
                            />
                        </div>

                        <input
                            type="number"
                            hidden
                            value={formData.invoiceStatusID}
                            onChange={e => setFormData({ ...formData, invoiceStatusID: Number(e.target.value) })}
                        />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Place of Supply</label>
                            <input
                                type="text"
                                value={formData.placeOfSupply}
                                onChange={e => setFormData({ ...formData, placeOfSupply: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="State/City"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="col-span-full font-semibold text-xs uppercase text-slate-500 tracking-wider mb-1">
                            Shipping & Transport Details
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Transport</label>
                            <input
                                type="text"
                                value={formData.transport}
                                onChange={e => setFormData({ ...formData, transport: e.target.value })}
                                className="w-full px-2.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Courier/Vendor"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Vehicle No</label>
                            <input
                                type="text"
                                value={formData.vehicleNo}
                                onChange={e => setFormData({ ...formData, vehicleNo: e.target.value })}
                                className="w-full px-2.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="MH-XX-XXXX"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">Station</label>
                            <input
                                type="text"
                                value={formData.station}
                                onChange={e => setFormData({ ...formData, station: e.target.value })}
                                className="w-full px-2.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Port/Station"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">GR/RR No</label>
                            <input
                                type="text"
                                value={formData.grrrNo}
                                onChange={e => setFormData({ ...formData, grrrNo: e.target.value })}
                                className="w-full px-2.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Ref No"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase">E-Way Bill</label>
                            <input
                                type="text"
                                value={formData.eWayBillNo}
                                onChange={e => setFormData({ ...formData, eWayBillNo: e.target.value })}
                                className="w-full px-2.5 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="E-Way Bill No"
                            />
                        </div>
                    </div>


                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b">
                                <tr>
                                    <th className="px-4 py-2 text-left">Product</th>
                                    <th className="px-4 py-2 text-left">Qty</th>
                                    <th className="px-4 py-2 text-left">Price</th>
                                    <th className="px-4 py-2 text-left">Tax</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800">{item.productName}</p>
                                            <p className="text-xs text-slate-500">{item.description}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{item.quantity}</td>
                                        <td className="px-4 py-3 text-slate-600">₹{item.unitPrice.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {(taxCategories as TaxCategory[]).find(t => t.taxCategoryID === item.taxCategoryID)?.taxName || "No Tax"}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Subtotal:</span>
                            <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Total Tax:</span>
                            <span className="font-semibold">₹{taxes.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">Discount:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400">₹</span>
                                <input
                                    type="number"
                                    value={formData.discount}
                                    onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
                                    className="w-24 px-2 py-1 border rounded bg-white text-right text-sm focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t pt-2 mt-2">
                            <span>Grand Total:</span>
                            <span className="text-blue-900">₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="reverseCharge"
                            checked={formData.reverseCharge}
                            onChange={e => setFormData({ ...formData, reverseCharge: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                        />
                        <label htmlFor="reverseCharge" className="text-sm font-medium text-slate-700">Reverse Charge Applicable</label>
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                            placeholder="Add invoice notes..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 btn-primary rounded-lg transition disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
                        >
                            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {isEdit ? "Update Invoice" : "Create Invoice"}</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InvoiceUpsertSheet;
