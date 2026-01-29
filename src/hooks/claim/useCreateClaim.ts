import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertClaimApi } from "../../api/claim.api";
import type { CreateClaimRequest } from "../../interfaces/claim.interface";

export const useCreateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClaimRequest) => upsertClaimApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["claims"],
      });
    },
  });
};
