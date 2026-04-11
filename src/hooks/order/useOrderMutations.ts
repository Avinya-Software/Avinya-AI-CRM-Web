// src/hooks/order/useOrderMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createOrder, updateOrder } from "../../api/order.api";
import type { CreateOrderDto } from "../../interfaces/order.interface";

// ── Create Order ───────────────────────────────────────────────────
export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateOrderDto) => createOrder(data),
        onSuccess: (response: any) => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            toast.success(response?.statusMessage || "Order created successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to create order. Please try again.");
        },
    });
};

// ── Update Order ───────────────────────────────────────────────────
export const useUpdateOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateOrderDto }) =>
            updateOrder(id, data),
        onSuccess: (response: any) => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            toast.success(response?.statusMessage || "Order updated successfully!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to update order. Please try again.");
        },
    });
};