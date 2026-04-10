// src/hooks/invoice/useInvoices.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { InvoiceFilters, CreateInvoiceDto, UpdateInvoiceDto } from "../../interfaces/invoice.interface";
import { 
  createInvoice, 
  deleteInvoice, 
  getInvoiceById, 
  getInvoices, 
  updateInvoice,
  getInvoiceStatusDropdown
} from "../../api/invoice.api";


// ── Fetch invoices with filters ──────────────────────────────────────
export const useInvoices = (filters: InvoiceFilters) => {
  return useQuery({
    queryKey: ['invoices', filters.search, filters.page, filters.pageSize, filters.status],
    queryFn: () => getInvoices(filters),
    staleTime: 30000,
  });
};

// ── Fetch single invoice by ID ───────────────────────────────────────
export const useInvoice = (id: string | null) => {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoiceById(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// ── Create invoice mutation ──────────────────────────────────────────
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
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
    mutationFn: deleteInvoice,
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
  return useQuery({
    queryKey: ["invoice-status-dropdown"],
    queryFn: getInvoiceStatusDropdown,
    staleTime: 60000,
  });
};
