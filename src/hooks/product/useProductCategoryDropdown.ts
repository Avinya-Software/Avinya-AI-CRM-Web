import { useMutation, useQuery } from "@tanstack/react-query";
import { getProductCategoryDropdownApi } from "../../api/product.api";

export const useProductCategoryDropdown = () => {
  return useMutation({
    mutationFn: () => getProductCategoryDropdownApi(),
  });
};

export const useProductCategoryDropdownQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["product-category-dropdown"],
    queryFn: () => getProductCategoryDropdownApi(),
    enabled,
  });
};
