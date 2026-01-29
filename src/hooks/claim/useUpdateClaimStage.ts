import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateClaimStageApi } from "../../api/claim.api";

export const useUpdateClaimStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      claimId,
      stageId,
      notes,
    }: {
      claimId: string;
      stageId: number;
      notes?: string;
    }) =>
      updateClaimStageApi(claimId, stageId, notes),

    onSuccess: () => {
      toast.success("Claim stage updated successfully");

      // 🔄 refresh claims list
      queryClient.invalidateQueries({
        queryKey: ["claims"],
      });
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data ||
          "Failed to update claim stage"
      );
    },
  });
};
