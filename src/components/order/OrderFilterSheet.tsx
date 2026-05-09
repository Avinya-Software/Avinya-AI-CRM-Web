// src/components/order/OrderFilterSheet.tsx

import { useState, useEffect } from "react";
import { DatePicker, Select as AntSelect } from "antd";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { OrderFilters } from "../../interfaces/order.interface";
import { useOrderStatusDropdownQuery } from "../../hooks/order/useOrders";

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
    const { data: orderStatusData = [] } = useOrderStatusDropdownQuery(open);

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
                        <AntSelect
                            showSearch
                            className="w-full h-10"
                            value={local.status || undefined}
                            onChange={(val) => setLocal((p) => ({ ...p, status: val }))}
                            placeholder="Select option..."
                            optionFilterProp="children"
                            allowClear
                        >
                            {(orderStatusData as any[]).map((o) => (
                                <AntSelect.Option key={o.statusID} value={String(o.statusID)}>
                                    {o.statusName || "Unknown"}
                                </AntSelect.Option>
                            ))}
                        </AntSelect>
                    </div>

                    {/* From Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            From Date
                        </label>
                        <DatePicker
                            className="w-full h-10 border-slate-300 rounded-lg"
                            format="YYYY-MM-DD"
                            placeholder="Select start date"
                            value={local.startDate ? dayjs(local.startDate) : null}
                            onChange={(date, dateString) =>
                                setLocal(prev => ({ ...prev, startDate: Array.isArray(dateString) ? dateString[0] : dateString }))
                            }
                        />
                    </div>

                    {/* To Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            To Date
                        </label>
                        <DatePicker
                            className="w-full h-10 border-slate-300 rounded-lg"
                            format="YYYY-MM-DD"
                            placeholder="Select end date"
                            value={local.endDate ? dayjs(local.endDate) : null}
                            onChange={(date, dateString) =>
                                setLocal(prev => ({ ...prev, endDate: Array.isArray(dateString) ? dateString[0] : dateString }))
                            }
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
                        className="flex-1 h-10 btn-primary rounded-lg text-sm font-medium transition"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};

export default OrderFilterSheet;