import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertPolicyApi } from "../../api/policy.api";

export const useUpsertPolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertPolicyApi,
    onSuccess: () => {
      // refresh policies list later if needed
      queryClient.invalidateQueries({ queryKey: ["policies"] });
    },
  });
};
