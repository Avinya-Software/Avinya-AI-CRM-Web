import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertProductApi } from "../../api/product.api";

export const useUpsertProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertProductApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
