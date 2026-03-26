// src/hooks/order/useOrders.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { OrderFilters } from "../../interfaces/order.interface";
import { createOrder, deleteOrder, getDesignStatusDropdown, getOrderById, getOrderDropdown, getOrders, getOrderStatusDropdown, updateOrder } from "../../api/order.api";


// ── Fetch orders with filters ──────────────────────────────────────
export const useOrders = (filters: OrderFilters) => {
  return useQuery({
    queryKey:  ['orders', filters.search, filters.page, filters.pageSize, filters.status],
    queryFn: () => getOrders(filters),
    staleTime: 30000,
  });
};

// ── Fetch single order by ID ───────────────────────────────────────
export const useOrder = (id: string | null) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// ── Fetch order dropdown list ──────────────────────────────────────
export const useOrderDropdown = () => {
  return useQuery({
    queryKey: ["order-dropdown"],
    queryFn: getOrderDropdown,
    staleTime: 60000,
  });
};

// ── Create order mutation ──────────────────────────────────────────
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order created successfully!");
    },
    onError: () => {
      toast.error("Failed to create order. Please try again.");
    },
  });
};

// ── Update order mutation ──────────────────────────────────────────
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update order. Please try again.");
    },
  });
};

// ── Delete order mutation ──────────────────────────────────────────
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete order.");
    },
  });
};

// ── Fetch order status dropdown list ──────────────────────────────────────
export const useOrderStatusDropdown = () => {
  return useQuery({
    queryKey: ["order-status-dropdown"],
    queryFn: getOrderStatusDropdown,
    staleTime: 60000,
  });
};

// ── Fetch design status dropdown list ──────────────────────────────────────
export const useDesignStatusDropdown = () => {
  return useQuery({
    queryKey: ["design-status-dropdown"],
    queryFn: getDesignStatusDropdown,
    staleTime: 60000,
  });
};