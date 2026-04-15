// src/hooks/followup/useFollowUpMutations.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  createFollowUp,
  updateFollowUp,
  updateFollowUpStatus,
  deleteFollowUp,
  getFollowUpById,
} from "../../api/followup.api";
import {
  CreateFollowUpDto,
  UpdateFollowUpDto,
} from "../../interfaces/followup.interface";

// ── Create Follow-Up ───────────────────────────────────────────────
export const useCreateFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFollowUpDto) => createFollowUp(data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["lead-followups"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail"] });
      toast.success(response?.statusMessage || "Follow-up created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to create follow-up");
    },
  });
};

// ── Update Follow-Up ───────────────────────────────────────────────
export const useUpdateFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followUpId,
      data,
    }: {
      followUpId: string;
      data: UpdateFollowUpDto;
    }) => updateFollowUp(followUpId, data),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["lead-followups"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail"] });
      toast.success(response?.statusMessage || "Follow-up updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to update follow-up");
    },
  });
};

// ── Update Follow-Up Status ────────────────────────────────────────
export const useUpdateFollowUpStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followUpId,
      status,
    }: {
      followUpId: string;
      status: string;
    }) => updateFollowUpStatus(followUpId, status),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["lead-followups"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail"] });
      toast.success(response?.statusMessage || "Status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to update status");
    },
  });
};

// ── Delete Follow-Up ───────────────────────────────────────────────
export const useDeleteFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (followUpId: string) => deleteFollowUp(followUpId),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["lead-followups"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-detail"] });
      toast.success(response?.statusMessage || "Follow-up deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to delete follow-up");
    },
  });
};

// ── Get Follow-Up By ID ────────────────────────────────────────────
export const useGetFollowUpById = () => {
  return useMutation({
    mutationFn: (followUpId: string) =>
      getFollowUpById(followUpId),

    onError: (error: any) => {
      toast.error(error?.response?.data?.statusMessage || error?.response?.data?.message || "Failed to fetch follow-up details");
    },
  });
};
