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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      if (variables.leadID) {
        queryClient.invalidateQueries({ queryKey: ["lead-detail", String(variables.leadID)] });
      }
      toast.success("Quotation created successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to create quotation";
      toast.error(message);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation"] });
      queryClient.invalidateQueries({ queryKey: ["quotation-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail"] });
      toast.success("Quotation updated successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to update quotation";
      toast.error(message);
    },
  });
};

// ── Delete Quotation ───────────────────────────────────────────────
export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotations"] });
      queryClient.invalidateQueries({ queryKey: ["quotation-dropdown"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Quotation deleted successfully");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Failed to delete quotation";
      toast.error(message);
    },
  });
};