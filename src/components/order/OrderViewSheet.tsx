// src/components/order/OrderViewSheet.tsx

import { X, Pencil } from "lucide-react";
import type { Order } from "../../interfaces/order.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onEdit: () => void;
}

const STATUS_LABEL: Record<number, string> = {
  0: "Pending",
  1: "Processing",
  2: "Completed",
  3: "Cancelled",
};

const STATUS_STYLE: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-700",
  1: "bg-blue-100 text-blue-700",
  2: "bg-green-100 text-green-700",
  3: "bg-red-100 text-red-700",
};

const DESIGN_STATUS_LABEL: Record<number, string> = {
  0: "Pending",
  1: "In Progress",
  2: "Approved by Client",
  3: "Rejected",
};

const DESIGN_STATUS_STYLE: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-700",
  1: "bg-blue-100 text-blue-700",
  2: "bg-green-100 text-green-700",
  3: "bg-red-100 text-red-700",
};

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <p className="text-xs text-slate-500 mb-0.5">{label}</p>
    <p className="text-sm text-slate-800">{value ?? "-"}</p>
  </div>
);

const OrderViewSheet = ({ open, onClose, order, onEdit }: Props) => {
  if (!open) return null;

  // ✅ API returns "orderItems" not "items"
  const orderItems = order?.orderItems ?? order?.orderItems ?? [];

  const subtotal = orderItems.reduce((sum: number, item: any) => sum + (item.lineTotal ?? 0), 0);
  const tax = order?.taxes ?? 0;
  const grandTotal = order?.grandTotal ?? subtotal + tax;

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
            <h2 className="text-lg font-semibold text-slate-800">Order Summary</h2>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-100 text-slate-400"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {order ? (
              <>
                {/* Order No + Status Badges */}
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-bold text-slate-800">{order.orderNo ?? "—"}</h3>
                  <div className="flex flex-col gap-1 items-end">
                    <span className={`px-3 py-0.5 rounded text-xs font-medium ${STATUS_STYLE[order.status ?? 0]}`}>
                      Order: {STATUS_LABEL[order.status ?? 0]}
                    </span>
                    <span className={`px-3 py-0.5 rounded text-xs font-medium ${DESIGN_STATUS_STYLE[order.designStatus ?? 0]}`}>
                      Design: {DESIGN_STATUS_LABEL[order.designStatus ?? 0]}
                    </span>
                  </div>
                </div>

                {/* Order Details Section */}
                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <Field label="Client" value={order.clientName} />
                    <Field label="Company" value={order.companyName} />
                    <Field label="GST Number" value={order.gstNo ?? "-"} />
                    <Field label="Quotation No" value={order.quotationNo ?? "N/A"} />
                    <Field
                      label="Order Date"
                      value={order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString("en-IN")
                        : "—"}
                    />
                    <Field
                      label="Expected Delivery"
                      value={order.expectedDeliveryDate
                        ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN")
                        : "—"}
                    />
                    <Field label="Design By Us" value={order.isDesignByUs ? "Yes" : "No"} />
                    <Field label="Created By" value={order.createdByName} />
                    <Field label="Assigned Designer" value={order.assignedDesignToName ?? "-"} />
                    <Field label="Billing Address" value={order.billAddress ?? "-"} />
                    {!order.isUseBillingAddress && (
                      <Field label="Shipping Address" value={order.shippingAddress ?? "-"} />
                    )}
                  </div>
                </div>

                {/* Order Items Section */}
                {orderItems.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b bg-slate-50">
                      <h4 className="text-sm font-semibold text-slate-700">Order Items</h4>
                    </div>
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          {["Product", "Description", "Qty", "Unit Price", "Line Total"].map((col) => (
                            <th
                              key={col}
                              className="px-4 py-2 text-left text-xs font-medium text-slate-500"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orderItems.map((item: any, i: number) => (
                          <tr key={item.orderItemID ?? i} className="hover:bg-slate-50">
                            <td className="px-4 py-2.5 text-slate-700">{item.productName ?? "—"}</td>
                            <td className="px-4 py-2.5 text-slate-500">{item.description ?? "-"}</td>
                            <td className="px-4 py-2.5 text-slate-700">{item.quantity}</td>
                            <td className="px-4 py-2.5 text-slate-700">₹{item.unitPrice?.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-slate-700 font-medium">
                              ₹{item.lineTotal?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Order Summary Totals */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b bg-slate-50">
                    <h4 className="text-sm font-semibold text-slate-700">Order Summary</h4>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {order.enableTax && tax > 0 && (
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Tax:</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>
                    )}
                    {order.isDesignByUs && order.designingCharge > 0 && (
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Designing Charge:</span>
                        <span>₹{order.designingCharge.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-800 pt-2 border-t">
                      <span>Grand Total:</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-sm">No order selected.</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 text-sm border px-4 py-2 rounded-lg hover:bg-white text-slate-600 font-medium"
            >
              <Pencil size={13} /> Edit Order
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderViewSheet;