import { useQuery } from "@tanstack/react-query";
import { getProductsApi } from "../../api/product.api";

export const useProducts = (filters: {
  pageNumber: number;
  pageSize: number;
  productCategoryId?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => getProductsApi(filters),
  });
};
