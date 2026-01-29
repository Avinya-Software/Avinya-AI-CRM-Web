import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteProductApi } from "../../api/product.api";

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      deleteProductApi(productId),

    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to delete product"
      );
    },
  });
};
