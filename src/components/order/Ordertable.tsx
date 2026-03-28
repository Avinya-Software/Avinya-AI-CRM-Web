// src/components/order/OrderTable.tsx

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Pencil, Trash2, PackageOpen, X } from "lucide-react";
import type { Order } from "../../interfaces/order.interface";
import { usePermissions } from "../../context/PermissionContext"; // ✅ ADDED

interface Props {
    data: Order[];
    loading: boolean;
    onView: (order: Order) => void;
    onEdit: (order: Order) => void;
    onDelete: (order: Order) => void;
    onAdd: () => void;
}

const STATUS_STYLE: Record<number, string> = {
    1: "bg-yellow-100 text-yellow-700",
    2: "bg-blue-100 text-blue-700",
    3: "bg-green-100 text-green-700",
    4: "bg-red-100 text-red-700",
    5: "bg-purple-100 text-red-700"
};


const DESIGN_STATUS_STYLE: Record<number, string> = {
    1: "bg-yellow-100 text-yellow-700",
    2: "bg-blue-100 text-blue-700",
    3: "bg-green-100 text-green-700",
    4: "bg-red-100 text-red-700",
};

/* ================= ACTION MENU ================= */

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

/* ================= MAIN TABLE ================= */

const OrderTable = ({ data, loading, onView, onEdit, onDelete, onAdd }: Props) => {

    /* ✅ PERMISSIONS ADDED */
    const { hasPermission } = usePermissions();

    const canViewOrder = hasPermission("order", "view");
    const canEditOrder = hasPermission("order", "edit");
    const canDeleteOrder = hasPermission("order", "delete");

    const [confirmDelete, setConfirmDelete] = useState<Order | null>(null);

    const handleDeleteConfirmed = () => {
        if (!confirmDelete || !canDeleteOrder) return;
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

                {/* ✅ ADD PROTECTION */}
                {canEditOrder && (
                    <button
                        onClick={onAdd}
                        className="text-sm text-blue-900 font-medium hover:underline"
                    >
                        + Add your first order
                    </button>
                )}
            </div>
        );
    }

    const columns = [
        "Order No",
        "Customer Name",
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
                                    className={`px-4 py-3 font-medium whitespace-nowrap ${col === "Actions" ? "w-16 text-center" : "text-left"}`}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {data.map((order) => (
                            <tr key={order.orderID} className="hover:bg-slate-50 transition-colors">

                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {order.orderNo ?? "—"}
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                    {order.clientName ?? "—"}
                                </td>

                                <td className="px-4 py-3 text-slate-500">
                                    {order.orderDate
                                        ? new Date(order.orderDate).toLocaleDateString("en-IN")
                                        : "—"}
                                </td>

                                <td className="px-4 py-3 text-slate-500">
                                    {order.expectedDeliveryDate
                                        ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN")
                                        : "—"}
                                </td>

                                <td className="px-4 py-3 font-medium">
                                    ₹{order.totalAmount?.toFixed(2) ?? "0.00"}
                                </td>

                                <td className="px-4 py-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[order.status ?? 0]}`}>
                                        {order.statusName}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${DESIGN_STATUS_STYLE[order.designStatus ?? 0]}`}>
                                        {order.designStatusName}
                                    </span>
                                </td>

                                <td className="px-4 py-3 text-center">
                                    <ActionMenu
                                        onView={() => canViewOrder && onView(order)}
                                        onEdit={() => canEditOrder && onEdit(order)}
                                        onDeleteClick={() =>
                                            canDeleteOrder && setConfirmDelete(order)
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* DELETE MODAL */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-[420px] p-6 shadow-lg">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-lg font-semibold">Delete Order</h3>
                            <button onClick={() => setConfirmDelete(null)}>
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-6">
                            Delete order <b>{confirmDelete.orderNo}</b> ?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteConfirmed}
                                className="px-4 py-2 bg-red-600 text-white rounded"
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