// src/hooks/payment/usePayments.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { 
  createPayment, 
  getPaymentById, 
  getPaymentsByInvoiceId, 
  updatePayment 
} from "../../api/payment.api";
import { CreatePaymentDto, UpdatePaymentDto } from "../../interfaces/payment.interface";

// ── Fetch payments by invoice ID ──────────────────────────────────────
export const usePayments = (invoiceId: string | null) => {
  return useQuery({
    queryKey: ['payments', invoiceId],
    queryFn: () => getPaymentsByInvoiceId(invoiceId!),
    enabled: !!invoiceId,
    staleTime: 30000,
  });
};

// ── Fetch single payment by ID ────────────────────────────────────────
export const usePayment = (id: string | null) => {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPaymentById(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// ── Create payment mutation ───────────────────────────────────────────
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentDto) => createPayment(data),
    onSuccess: (data) => {
      // Invalidate both payments list for that invoice and general invoices list (to update balance)
      queryClient.invalidateQueries({ queryKey: ["payments", data.invoiceID] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", data.invoiceID] });
      toast.success("Payment recorded successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data || "Failed to record payment. Please try again.");
    },
  });
};

// ── Update payment mutation ───────────────────────────────────────────
export const useUpdatePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePaymentDto) => updatePayment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payments", data.invoiceID] });
      queryClient.invalidateQueries({ queryKey: ["payment", data.paymentID] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", data.invoiceID] });
      toast.success("Payment updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data || "Failed to update payment.");
    },
  });
};
