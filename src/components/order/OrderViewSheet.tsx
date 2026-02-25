// src/components/order/OrderViewSheet.tsx

import { X, Pencil, Package } from "lucide-react";
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

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
    <p className="text-sm text-slate-800 font-medium">{value ?? "—"}</p>
  </div>
);

const YesNo = ({ value }: { value: boolean | undefined }) => (
  <span
    className={`px-2 py-0.5 rounded text-xs font-medium ${
      value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
    }`}
  >
    {value ? "Yes" : "No"}
  </span>
);

const OrderViewSheet = ({ open, onClose, order, onEdit }: Props) => {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[480px] bg-white z-50 shadow-xl flex flex-col transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800">
                {order?.orderNo ?? "Order Details"}
              </h2>
              <p className="text-xs text-slate-400">{order?.clientName ?? "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 text-sm border px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-600"
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-100 text-slate-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
          {order ? (
            <>
              {/* Status badges */}
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    STATUS_STYLE[order.status ?? 0]
                  }`}
                >
                  {STATUS_LABEL[order.status ?? 0]}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    DESIGN_STATUS_STYLE[order.designStatus ?? 0]
                  }`}
                >
                  {DESIGN_STATUS_LABEL[order.designStatus ?? 0]}
                </span>
              </div>

              {/* Order Info */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Order Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Detail label="Order No"          value={order.orderNo} />
                  <Detail label="Client"            value={order.clientName} />
                  <Detail label="Order Date"
                    value={order.orderDate
                      ? new Date(order.orderDate).toLocaleDateString("en-IN")
                      : "—"}
                  />
                  <Detail label="Expected Delivery"
                    value={order.expectedDeliveryDate
                      ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN")
                      : "—"}
                  />
                  <Detail label="Total Amount"      value={`₹${order.totalAmount?.toFixed(2) ?? "0.00"}`} />
                  <Detail label="Assigned Design To" value={order.assignedDesignTo} />
                </div>
              </div>

              {/* Flags */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                  Flags
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Design By Us</p>
                    <YesNo value={order.isDesignByUs} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Tax Enabled</p>
                    <YesNo value={order.enableTax} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Use Billing Address</p>
                    <YesNo value={order.isUseBillingAddress} />
                  </div>
                  {order.isDesignByUs && (
                    <Detail label="Designing Charge" value={`₹${order.designingCharge ?? 0}`} />
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {!order.isUseBillingAddress && order.shippingAddress && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    Shipping Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Detail label="Address" value={order.shippingAddress} />
                    <Detail label="State"   value={order.stateName} />
                    <Detail label="City"    value={order.cityName} />
                  </div>
                </div>
              )}

              {/* Product Items */}
              {order.items && order.items.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                    Product Items
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          {["Product", "Description", "Unit Price", "Qty", "Total"].map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2 text-left text-xs font-medium text-slate-500"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {order.items.map((item, i) => (
                          <tr key={item.orderItemID ?? i}>
                            <td className="px-3 py-2 text-slate-700">{item.productName ?? "—"}</td>
                            <td className="px-3 py-2 text-slate-500">{item.description ?? "—"}</td>
                            <td className="px-3 py-2 text-slate-700">₹{item.unitPrice?.toFixed(2)}</td>
                            <td className="px-3 py-2 text-slate-700">{item.quantity}</td>
                            <td className="px-3 py-2 text-slate-700 font-medium">
                              ₹{item.lineTotal?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between text-base font-semibold text-blue-900">
                  <span>Total Amount</span>
                  <span>₹{order.totalAmount?.toFixed(2) ?? "0.00"}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm">No order selected.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderViewSheet;