import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertInsurerApi } from "../../api/insurer.api";

export const useUpsertInsurer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertInsurerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurers"] });
    },
  });
};
