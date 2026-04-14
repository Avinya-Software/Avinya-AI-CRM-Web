// src/hooks/quotation/useQuotations.ts

import { useMutation, useQuery } from "@tanstack/react-query";
import { QuotationFilters } from "../../interfaces/quotation.interface";
import {
  getQuotationById,
  getQuotationDropdown,
  getQuotations,
  getQuotationStatusDropdown
} from "../../api/Quotation.api";

// ── Fetch quotations with filters ──────────────────────────────────
export const useQuotations = (filters: QuotationFilters) => {
  return useQuery({
    queryKey: ["quotations", filters],
    queryFn: () => getQuotations(filters),
  });
};

// ── Fetch single quotation by ID ───────────────────────────────────
export const useQuotation = () => {
  return useMutation({
    mutationFn: (id: string) => getQuotationById(id),
  });
};

// ── Fetch quotation dropdown list ──────────────────────────────────
export const useQuotationDropdown = () => {
  return useMutation({
    mutationFn: () => getQuotationDropdown(),
  });
};

// ── Fetch quotation status dropdown list ───────────────────────────
export const useQuotationStatusDropdown = () => {
  return useQuery({
    queryKey: ["quotation-status-dropdown"],
    queryFn: () => getQuotationStatusDropdown(),
  });
};
