import { useMutation } from "@tanstack/react-query";
import { getProductCategoryDropdownApi } from "../../api/product.api";

export const useProductCategoryDropdown = () => {
  return useMutation({
    mutationFn: () => getProductCategoryDropdownApi(),
  });
};
