import { useQuery } from "@tanstack/react-query";
import { getProductCategoryDropdownApi } from "../../api/product.api";

export const useProductCategoryDropdown = () => {
  return useQuery({
    queryKey: ["product-category-dropdown"],
    queryFn: getProductCategoryDropdownApi,
  });
};
