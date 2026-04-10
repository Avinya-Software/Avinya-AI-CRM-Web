// src/hooks/quotation/useQuotations.ts

import { useMutation } from "@tanstack/react-query";
import { QuotationFilters } from "../../interfaces/quotation.interface";
import { getQuotationById, getQuotationDropdown, getQuotations } from "../../api/Quotation.api";

// ── Fetch quotations with filters ──────────────────────────────────
export const useQuotations = () => {
  return useMutation({
    mutationFn: (filters: QuotationFilters) => getQuotations(filters),
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
