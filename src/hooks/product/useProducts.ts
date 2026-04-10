import { useMutation } from "@tanstack/react-query";
import { getProductsApi } from "../../api/product.api";

export const useProducts = () => {
  return useMutation({
    mutationFn: (filters: {
      pageNumber: number;
      pageSize: number;
      status?: boolean;
      search?: string;
    }) => getProductsApi(filters),
  });
};
