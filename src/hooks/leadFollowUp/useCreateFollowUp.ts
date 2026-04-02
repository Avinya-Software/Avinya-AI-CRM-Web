// src/hooks/leadFollowUp/useCreateFollowUp.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFollowUpApi } from "../../api/leadFollowUp.api";
import toast from "react-hot-toast";

export const useCreateFollowUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFollowUpApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead-followups"] });
      toast.success("Follow-up created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create follow-up");
    },
  });
};
