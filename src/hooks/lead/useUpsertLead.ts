import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { upsertLeadApi } from "../../api/lead.api";

export const useUpsertLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertLeadApi,

    onSuccess: (data) => {
      toast.success(
        data?.message ?? "Lead saved successfully"
      );

      queryClient.invalidateQueries({
        queryKey: ["leads"],
      });
    },

    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Failed to save lead";
      toast.error(msg);
    },
  });
};
