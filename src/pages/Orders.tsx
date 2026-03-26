// src/pages/Orders.tsx

import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Order, OrderFilters } from "../interfaces/order.interface";
import { useDeleteOrder, useOrders } from "../hooks/order/useOrders";
import OrderTable from "../components/order/Ordertable";
import Pagination from "../components/leads/Pagination";
import OrderFilterSheet from "../components/order/OrderFilterSheet";
import OrderUpsertSheet from "../components/order/OrderUpsertSheet";
import OrderViewSheet from "../components/order/OrderViewSheet";
import { usePermissions } from "../context/PermissionContext"; // ✅ PERMISSION
import { useDebounce } from "../components/common/CommonHelper";

const DEFAULT_FILTERS: OrderFilters = {
  page: 1,
  pageSize: 10,
  search: "",
  status: "",
  startDate: "",
  endDate: "",
};

const Orders = () => {

  /* ================= PERMISSIONS ================= */
  const { hasPermission } = usePermissions();

  const canAddOrder = hasPermission("order", "add");
  const canEditOrder = hasPermission("order", "edit");
  const canDeleteOrder = hasPermission("order", "delete");
  const canViewOrder = hasPermission("order", "view");
  /* ================================================= */

  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS);
  const [searchInput, setSearchInput] = useState("");

  const [openOrderSheet, setOpenOrderSheet] = useState(false);
  const [openViewSheet, setOpenViewSheet] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openFilterSheet, setOpenFilterSheet] = useState(false);

  const deleteMutation = useDeleteOrder();
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  useEffect(() => {
    setFilters(prev => {
      if (prev.search === debouncedSearchTerm) return prev;

      return {
        ...prev,
        search: debouncedSearchTerm,
        page: 1,
      };
    });
  }, [debouncedSearchTerm]);

  const { data, isLoading, isFetching } = useOrders(filters);
  const hasActiveFilters =
    filters.status || filters.startDate || filters.endDate;

  const clearAllFilters = () => {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
  };

  const handleAddOrder = () => {
    if (!canAddOrder) return; // ✅ protection
    setSelectedOrder(null);
    setOpenOrderSheet(true);
  };

  const handleViewOrder = (order: Order) => {
    if (!canViewOrder) return; // ✅ protection
    setSelectedOrder(order);
    setOpenViewSheet(true);
  };

  const handleEditOrder = (order: Order) => {
    if (!canEditOrder) return; // ✅ protection
    setSelectedOrder(order);
    setOpenOrderSheet(true);
  };

  const handleDeleteOrder = (order: Order) => {
    if (!canDeleteOrder) return; // ✅ protection
    deleteMutation.mutate(order.orderID);
  };

  const handleApplyFilters = (newFilters: OrderFilters) => {
    setFilters((prev) => ({
      ...prev,
      status: newFilters.status,
      startDate: newFilters.startDate,
      endDate: newFilters.endDate,
      page: 1,
    }));
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      {/* MAIN CARD */}
      <div className="bg-white rounded-lg border">

        {/* HEADER */}
        <div className="px-4 py-5 border-b bg-gray-100">
          <div className="grid grid-cols-2 gap-y-4 items-start">

            <div>
              <h1 className="text-4xl font-serif font-semibold text-slate-900">
                Orders
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {data?.totalRecords ?? 0} total orders
              </p>
            </div>

            {/* ADD ORDER */}
            <div className="text-right">
              {canAddOrder && ( /* ✅ button hidden if no permission */
                <button
                  className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 transition"
                  onClick={handleAddOrder}
                >
                  <span className="text-lg leading-none">+</span>
                  Add Order
                </button>
              )}
            </div>

            {/* SEARCH */}
            <div>
              <div className="relative w-[360px]">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* FILTER */}
            <div className="flex justify-end gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-50"
                >
                  <X size={14} />
                  Clear Filters
                </button>
              )}

              <button
                onClick={() => setOpenFilterSheet(true)}
                className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 relative"
              >
                <Filter size={16} />
                Filter Order
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <OrderTable
          data={data?.data ?? []}
          loading={isLoading || isFetching}
          onView={handleViewOrder}
          onEdit={handleEditOrder}
          onDelete={handleDeleteOrder}
          onAdd={handleAddOrder}
        />

        {/* PAGINATION */}
        <div className="border-t px-4 py-3">
          <Pagination
            page={filters.page}
            totalPages={data?.totalPages ?? 1}
            onChange={(page) =>
              setFilters((prev) => ({ ...prev, page }))
            }
          />
        </div>
      </div>

      {/* FILTER SHEET */}
      <OrderFilterSheet
        open={openFilterSheet}
        onClose={() => setOpenFilterSheet(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onClear={() => {
          setFilters((prev) => ({
            ...prev,
            status: "",
            startDate: "",
            endDate: "",
            page: 1,
          }));
        }}
      />

      {/* VIEW SHEET */}
      <OrderViewSheet
        open={openViewSheet}
        onClose={() => {
          setOpenViewSheet(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
        onEdit={() => {
          if (!canEditOrder) return;
          setOpenViewSheet(false);
          setOpenOrderSheet(true);
        }}
      />

      {/* UPSERT SHEET */}
      <OrderUpsertSheet
        open={openOrderSheet}
        onClose={() => {
          setOpenOrderSheet(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </>
  );
};

export default Orders;