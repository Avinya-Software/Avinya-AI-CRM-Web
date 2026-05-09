import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { OrderFilters } from "../../interfaces/order.interface";
import { createOrder, deleteOrder, getDesignStatusDropdown, getOrderById, getOrderDropdown, getOrders, getOrderStatusDropdown, updateOrder, sendOrderEmail } from "../../api/order.api";


// ── Fetch orders with filters ──────────────────────────────────────
export const useOrders = () => {
  return useMutation({
    mutationFn: (filters: OrderFilters) => getOrders(filters),
  });
};

export const useOrdersQuery = (filters: OrderFilters) => {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => getOrders(filters),
  });
};

// ── Fetch single order by ID ───────────────────────────────────────
export const useOrder = () => {
  return useMutation({
    mutationFn: (id: string) => getOrderById(id),
  });
};

// ── Fetch order dropdown list ──────────────────────────────────────
export const useOrderDropdown = () => {
  return useMutation({
    mutationFn: () => getOrderDropdown(),
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
  return useMutation({
    mutationFn: () => getOrderStatusDropdown(),
  });
};

export const useOrderStatusDropdownQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["order-status-dropdown"],
    queryFn: () => getOrderStatusDropdown(),
    enabled,
  });
};

// ── Fetch design status dropdown list ──────────────────────────────────────
export const useDesignStatusDropdown = () => {
  return useMutation({
    mutationFn: () => getDesignStatusDropdown(),
  });
};

export const useDesignStatusDropdownQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["design-status-dropdown"],
    queryFn: () => getDesignStatusDropdown(),
    enabled,
  });
};

// ── Send Order Email ───────────────────────────────────────────────
export const useSendOrderEmail = () => {
  return useMutation({
    mutationFn: (id: string) => sendOrderEmail(id),
    onSuccess: () => {
      toast.success("Order email sent successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send email");
    },
  });
};
