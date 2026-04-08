// src/components/invoice/InvoiceViewSheet.tsx
import { X, Download, FileText, IndianRupee } from "lucide-react";
import type { Invoice } from "../../interfaces/invoice.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onDownload?: () => void;
  onRecordPayment?: () => void;
}

const STATUS_STYLE: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-700",
  2: "bg-green-100 text-green-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-red-100 text-red-700",
};

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
    <p className="text-sm text-slate-800 font-medium">{value ?? "—"}</p>
  </div>
);

const InvoiceViewSheet = ({ open, onClose, invoice, onDownload, onRecordPayment }: Props) => {
  if (!open || !invoice) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText size={18} className="text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Invoice Summary</h2>
                <p className="text-xs text-slate-400">{invoice.invoiceNo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-100 text-slate-400"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Invoice No + Status Badge */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-bold text-slate-800">{invoice.invoiceNo ?? "—"}</h3>
              <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[invoice.invoiceStatusID ?? 1] ?? "bg-slate-100 text-slate-600"}`}>
                {invoice.statusName ?? "Pending"}
              </span>
            </div>

            {/* Invoice Details Section */}
            <div className="border rounded-lg p-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Invoice Details</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <Field label="Customer" value={invoice.companyName} />
                <Field label="contact Person" value={invoice.contactPerson} />
                <Field label="Order No" value={invoice.orderNo ?? "Direct Invoice"} />
                <Field label="Place of Supply" value={invoice.placeOfSupply} />
                <Field
                  label="Invoice Date"
                  value={invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                />
                <Field
                  label="Due Date"
                  value={invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                />
                <Field label="Reverse Charge" value={invoice.reverseCharge ? "Yes" : "No"} />
                <Field label="E-Way Bill No" value={invoice.eWayBillNo} />
              </div>
            </div>

            {/* Transport / Shipping Section */}
            {(invoice.transport || invoice.vehicleNo || invoice.station || invoice.grrrNo) && (
              <div className="border rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Shipping & Transport</h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <Field label="Transport" value={invoice.transport} />
                  <Field label="Vehicle No" value={invoice.vehicleNo} />
                  <Field label="Station" value={invoice.station} />
                  <Field label="GR/RR No" value={invoice.grrrNo} />
                </div>
              </div>
            )}

            {/* Items Section */}
            {invoice.items && invoice.items.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b bg-slate-50">
                  <h4 className="text-sm font-semibold text-slate-700">Invoice Items</h4>
                </div>
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      {["Product", "Description", "Qty", "Unit Price", "Line Total"].map((col) => (
                        <th key={col} className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, i) => (
                      <tr key={item.invoiceItemID ?? i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-700">{item.productName ?? "—"}</td>
                        <td className="px-4 py-2.5 text-slate-500">{item.description ?? "—"}</td>
                        <td className="px-4 py-2.5 text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-slate-700">₹{item.unitPrice?.toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-slate-700 font-medium">₹{item.lineTotal?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financial Summary */}
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b bg-slate-50">
                <h4 className="text-sm font-semibold text-slate-700">Invoice Summary</h4>
              </div>
              <div className="px-4 py-3 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subTotal?.toFixed(2) ?? "0.00"}</span>
                </div>
                {(invoice.taxes ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Tax:</span>
                    <span>₹{invoice.taxes?.toFixed(2)}</span>
                  </div>
                )}
                {(invoice.discount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Discount:</span>
                    <span className="text-red-500">− ₹{invoice.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t">
                  <span>Grand Total:</span>
                  <span className="text-slate-900">₹{invoice.grandTotal?.toFixed(2) ?? "0.00"}</span>
                </div>
                {(invoice.paidAmount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium">
                    <span>Paid Amount:</span>
                    <span>₹{invoice.paidAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-blue-900 pt-2 border-t border-dashed">
                  <span>Balance Due:</span>
                  <span>₹{invoice.remainingPayment?.toFixed(2) ?? "0.00"}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="border rounded-lg p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
            {onDownload ? (
              <button
                onClick={onDownload}
                className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-lg hover:bg-white text-slate-600 font-medium"
              >
                <Download size={13} /> Download PDF
              </button>
            ) : <div />}
            <div className="flex items-center gap-3">
              {onRecordPayment && (invoice.remainingPayment ?? 0) > 0 && (
                <button
                  onClick={onRecordPayment}
                  className="inline-flex items-center gap-1.5 text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium"
                >
                  <IndianRupee size={14} />Payment
                </button>
              )}
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceViewSheet;
