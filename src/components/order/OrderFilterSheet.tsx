// src/components/order/OrderFilterSheet.tsx

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { OrderFilters } from "../../interfaces/order.interface";

interface Props {
    open: boolean;
    onClose: () => void;
    filters: OrderFilters;
    onApply: (filters: OrderFilters) => void;
    onClear: () => void;
}

const ORDER_STATUSES = ["Pending", "Processing", "Completed", "Cancelled"];

const OrderFilterSheet = ({ open, onClose, filters, onApply, onClear }: Props) => {
    const [local, setLocal] = useState<OrderFilters>(filters);

    // Sync when parent filters change (e.g. external clear)
    useEffect(() => {
        setLocal(filters);
    }, [filters]);

    const handleApply = () => {
        onApply(local);
        onClose();
    };

    const handleReset = () => {
        const cleared: OrderFilters = { ...local, status: "", startDate: "", endDate: "" };
        setLocal(cleared);
        onClear();
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sheet */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white z-50 shadow-xl flex flex-col transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div>
                        <h2 className="font-semibold text-slate-800 text-base">Filter Orders</h2>
                        <p className="text-xs text-blue-600 mt-0.5">
                            Apply filters to refine order results
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
                    {/* Order Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Order Status
                        </label>
                        <select
                            value={local.status}
                            onChange={(e) => setLocal((p) => ({ ...p, status: e.target.value }))}
                            className="w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">Select option...</option>
                            {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* From Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            From Date
                        </label>
                        <input
                            type="date"
                            value={local.startDate}
                            onChange={(e) => setLocal((p) => ({ ...p, startDate: e.target.value }))}
                            className="w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            To Date
                        </label>
                        <input
                            type="date"
                            value={local.endDate}
                            onChange={(e) => setLocal((p) => ({ ...p, endDate: e.target.value }))}
                            className="w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t flex gap-3">
                    <button
                        onClick={handleReset}
                        className="flex-1 h-10 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 h-10 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default OrderFilterSheet;