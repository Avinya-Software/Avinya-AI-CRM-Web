import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRenewalStatusApi } from "../../api/renewal.api";

interface UpdateRenewalStatusPayload {
  renewalId: string;
  statusId: number;
}

export const useUpdateRenewalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      renewalId,
      statusId,
    }: UpdateRenewalStatusPayload) =>
      updateRenewalStatusApi(renewalId, statusId),

    onSuccess: () => {
      // 🔄 Re-fetch renewals list
      queryClient.invalidateQueries({
        queryKey: ["renewals"],
      });
    },
  });
};
