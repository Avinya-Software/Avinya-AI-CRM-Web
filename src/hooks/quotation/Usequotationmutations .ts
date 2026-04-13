// src/hooks/quotation/useQuotationMutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  CreateQuotationDto,
  UpdateQuotationDto,
} from "../../interfaces/quotation.interface";
import { createQuotation, deleteQuotation, updateQuotation } from "../../api/Quotation.api";

// ── Create Quotation ───────────────────────────────────────────────
export const useCreateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuotationDto) => createQuotation(data),
    onSuccess: (response: any, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      if (variables.leadID) {
        queryClient.invalidateQueries({ queryKey: ["lead-detail", String(variables.leadID)] });
      }
      toast.success(response?.statusMessage || "Quotation created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to create quotation");
    },
  });
};

// ── Update Quotation ───────────────────────────────────────────────
export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateQuotationDto;
    }) => updateQuotation(id, data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation"] });
      queryClient.invalidateQueries({ queryKey: ["quotation-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail"] });
      toast.success(response?.statusMessage || "Quotation updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to update quotation");
    },
  });
};

// ── Delete Quotation ───────────────────────────────────────────────
export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(response?.statusMessage || "Quotation deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to delete quotation");
    },
  });
};