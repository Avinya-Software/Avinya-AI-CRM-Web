// src/hooks/quotation/useQuotations.ts

import { useQuery } from "@tanstack/react-query";

import { QuotationFilters } from "../../interfaces/quotation.interface";
import { getQuotationById, getQuotationDropdown, getQuotations } from "../../api/Quotation.api";

// ── Fetch quotations with filters ──────────────────────────────────
export const useQuotations = (filters: QuotationFilters) => {
  return useQuery({
    queryKey: ["quotations", filters],
    queryFn: () => getQuotations(filters),
    staleTime: 30000,
  });
};

// ── Fetch single quotation by ID ───────────────────────────────────
export const useQuotation = (id: string | null) => {
  return useQuery({
    queryKey: ["quotation", id],
    queryFn: () => getQuotationById(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// ── Fetch quotation dropdown list ──────────────────────────────────
export const useQuotationDropdown = () => {
  return useQuery({
    queryKey: ["quotation-dropdown"],
    queryFn: getQuotationDropdown,
    staleTime: 60000, // 1 minute
  });
};