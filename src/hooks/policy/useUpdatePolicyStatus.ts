import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePolicyStatusApi } from "../../api/policy.api";

interface UpdatePolicyStatusPayload {
  policyId: string;
  statusId: number;
}

export const useUpdatePolicyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      policyId,
      statusId,
    }: UpdatePolicyStatusPayload) =>
      updatePolicyStatusApi(policyId, statusId),

    onSuccess: () => {
      // 🔄 re-fetch policies list
      queryClient.invalidateQueries({
        queryKey: ["policies"],
      });
    },
  });
};
