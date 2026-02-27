// src/components/order/OrderTable.tsx

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Pencil, Trash2, PackageOpen, X } from "lucide-react";
import type { Order } from "../../interfaces/order.interface";

interface Props {
    data: Order[];
    loading: boolean;
    onView: (order: Order) => void;
    onEdit: (order: Order) => void;
    onDelete: (order: Order) => void;
    onAdd: () => void;
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

// ── ActionMenu receives onDeleteClick to trigger parent modal ──────
const ActionMenu = ({
    onView,
    onEdit,
    onDeleteClick,
}: {
    onView: () => void;
    onEdit: () => void;
    onDeleteClick: () => void;
}) => {
    const [open, setOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const handleOpen = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setMenuPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 144,
            });
        }
        setOpen((p) => !p);
    };

    useEffect(() => {
        const close = () => setOpen(false);
        window.addEventListener("scroll", close, true);
        return () => window.removeEventListener("scroll", close, true);
    }, []);

    return (
        <>
            <div className="flex justify-center">
                <button
                    ref={btnRef}
                    onClick={handleOpen}
                    className="p-1 rounded hover:bg-slate-100"
                >
                    <MoreVertical size={16} className="text-slate-500" />
                </button>
            </div>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div
                        className="fixed z-50 w-36 bg-white rounded-lg shadow-lg border py-1 text-sm"
                        style={{ top: menuPos.top, left: menuPos.left }}
                    >
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
                            onClick={() => { setOpen(false); onDeleteClick(); }}
                            className="flex items-center gap-2 w-full px-3 py-2 hover:bg-red-50 text-red-600"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </>
            )}
        </>
    );
};

// ── Main Table ─────────────────────────────────────────────────────
const OrderTable = ({ data, loading, onView, onEdit, onDelete, onAdd }: Props) => {
    // ✅ confirmDelete lives here so the modal can render properly
    const [confirmDelete, setConfirmDelete] = useState<Order | null>(null);

    const handleDeleteConfirmed = () => {
        if (!confirmDelete) return;
        onDelete(confirmDelete);
        setConfirmDelete(null);
    };

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

    const columns = [
        "Order No",
        "Client Name",
        "Order Date",
        "Expected Delivery",
        "Total Amount",
        "Status",
        "Design Status",
        "Actions",
    ];

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                            {columns.map((col) => (
                                <th
                                    key={col}
                                    className={`px-4 py-3 font-medium whitespace-nowrap ${col === "Actions" ? "w-16 text-center" : "text-left"
                                        }`}
                                >
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
                                <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">
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
                                <td className="px-4 py-3 w-16 text-center">
                                    <ActionMenu
                                        onView={() => onView(order)}
                                        onEdit={() => onEdit(order)}
                                        onDeleteClick={() => setConfirmDelete(order)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CONFIRM DELETE MODAL */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Delete Order</h3>
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="p-1 rounded hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-1">
                            Are you sure you want to delete order{" "}
                            <span className="font-semibold text-slate-800">
                                {confirmDelete.orderNo}
                            </span>
                            ?
                        </p>
                        <p className="text-sm text-red-600 font-medium mb-6">
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 border rounded hover:bg-gray-100 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirmed}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default OrderTable;