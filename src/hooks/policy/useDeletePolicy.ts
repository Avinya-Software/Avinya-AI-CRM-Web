import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deletePolicyApi } from "../../api/policy.api";

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policyId: string) =>
      deletePolicyApi(policyId),

    onSuccess: (response: any) => {
      toast.success(response?.statusMessage || "Policy deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.statusMessage || err?.response?.data?.message || "Failed to delete policy"
      );
    },
  });
};
