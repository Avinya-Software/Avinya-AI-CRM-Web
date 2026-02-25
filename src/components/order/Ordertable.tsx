// src/components/order/OrderTable.tsx

import { useState } from "react";
import { MoreVertical, Eye, Pencil, Trash2, PackageOpen } from "lucide-react";
import type { Order } from "../../interfaces/order.interface";

interface Props {
    data: Order[];
    loading: boolean;
    onView: (order: Order) => void;
    onEdit: (order: Order) => void;
    onDelete: (order: Order) => void;
    onAdd: () => void;
}

// Backend int enum → display label
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

const ActionMenu = ({
    onView,
    onEdit,
    onDelete,
}: {
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((p) => !p)}
                className="p-1 rounded hover:bg-slate-100"
            >
                <MoreVertical size={16} className="text-slate-500" />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-36 bg-white rounded-lg shadow-lg border py-1 text-sm">
                        <button
                            onClick={() => { setOpen(false); onView(); }}
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                            <Eye size={14} /> View
                        </button>
                        <button
                            onClick={() => { setOpen(false); onEdit(); }}
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                            <Pencil size={14} /> Edit
                        </button>
                        <button
                            onClick={() => { setOpen(false); onDelete(); }}
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-600"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

const OrderTable = ({ data, loading, onView, onEdit, onDelete, onAdd }: Props) => {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-slate-400">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading orders…</span>
                </div>
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                <PackageOpen size={40} strokeWidth={1.2} />
                <p className="text-sm">No orders found</p>
                <button
                    onClick={onAdd}
                    className="text-sm text-blue-900 font-medium hover:underline"
                >
                    + Add your first order
                </button>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                        {[
                            "Order No",
                            "Client Name",
                            "Order Date",
                            "Expected Delivery",
                            "Total Amount",
                            "Status",
                            "Design Status",
                            "Actions",
                        ].map((col) => (
                            <th key={col} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((order) => (
                        <tr key={order.orderID} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                                {order.orderNo ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                {order.clientName ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                {order.orderDate
                                    ? new Date(order.orderDate).toLocaleDateString("en-IN")
                                    : "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                {order.expectedDeliveryDate
                                    ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN")
                                    : "—"}
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-medium">
                                ₹{order.totalAmount?.toFixed(2) ?? "0.00"}
                            </td>
                            <td className="px-4 py-3">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[order.status ?? 0] ?? "bg-slate-100 text-slate-600"
                                        }`}
                                >
                                    {STATUS_LABEL[order.status ?? 0] ?? "—"}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${DESIGN_STATUS_STYLE[order.designStatus ?? 0] ?? "bg-slate-100 text-slate-600"
                                        }`}
                                >
                                    {DESIGN_STATUS_LABEL[order.designStatus ?? 0] ?? "—"}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <ActionMenu
                                    onView={() => onView(order)}
                                    onEdit={() => onEdit(order)}
                                    onDelete={() => onDelete(order)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;