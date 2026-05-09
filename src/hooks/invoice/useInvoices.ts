// src/hooks/invoice/useInvoices.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { InvoiceFilters, CreateInvoiceDto, UpdateInvoiceDto } from "../../interfaces/invoice.interface";
import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoice,
  getInvoiceStatusDropdown,
  sendInvoiceEmail
} from "../../api/invoice.api";


// ── Fetch invoices with filters ──────────────────────────────────────
export const useInvoices = () => {
  return useMutation({
    mutationFn: (filters: InvoiceFilters) => getInvoices(filters),
  });
};

export const useInvoicesQuery = (filters: InvoiceFilters) => {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => getInvoices(filters),
  });
};

// ── Fetch single invoice by ID ───────────────────────────────────────
export const useInvoice = () => {
  return useMutation({
    mutationFn: (id: string) => getInvoiceById(id),
  });
};

// ── Create invoice mutation ──────────────────────────────────────────
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvoiceDto) => createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Invoice created successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data || "Failed to create invoice. Please try again.");
    },
  });
};

// ── Update invoice mutation ──────────────────────────────────────────
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateInvoiceDto) => updateInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Invoice updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data || "Failed to update invoice. Please try again.");
    },
  });
};

// ── Delete invoice mutation ──────────────────────────────────────────
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Invoice deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete invoice.");
    },
  });
};

// ── Fetch invoice status dropdown list ──────────────────────────────────────
export const useInvoiceStatusDropdown = () => {
  return useMutation({
    mutationFn: () => getInvoiceStatusDropdown(),
  });
};

export const useInvoiceStatusDropdownQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["invoice-status-dropdown"],
    queryFn: () => getInvoiceStatusDropdown(),
    enabled,
  });
};

// ── Send Invoice Email ───────────────────────────────────────────────
export const useSendInvoiceEmail = () => {
  return useMutation({
    mutationFn: (id: string) => sendInvoiceEmail(id),
    onSuccess: () => {
      toast.success("Invoice email sent successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to send email");
    },
  });
};
