import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteClaimApi } from "../../api/claim.api";

export const useDeleteClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (claimId: string) =>
      deleteClaimApi(claimId),

    onSuccess: () => {
      toast.success("Claim deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to delete claim"
      );
    },
  });
};
