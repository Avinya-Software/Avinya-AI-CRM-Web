import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateLeadApi, upsertLeadApi } from "../../api/lead.api";

export const useUpsertLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      if (payload.LeadID) {
        return updateLeadApi(payload.LeadID, payload); // PUT
      }

      return upsertLeadApi(payload); // POST
    },

    onSuccess: (data) => {
      toast.success(data?.message ?? "Lead saved successfully");

      queryClient.invalidateQueries({
        queryKey: ["leads"],
      });
      queryClient.invalidateQueries({
        queryKey: ["lead-summary"],
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
