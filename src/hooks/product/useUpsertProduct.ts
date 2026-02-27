import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertProductApi, upsertUpdateProductApi } from "../../api/product.api";

export const useUpsertProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => {
      if (payload.productID) {
        // Edit mode — PATCH with id in path
        return upsertUpdateProductApi(payload.productID, payload);
      }
      // Create mode — POST
      return upsertProductApi(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};