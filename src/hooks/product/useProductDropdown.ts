import { useMutation } from "@tanstack/react-query";
import { getProductDropdownApi } from "../../api/product.api";

export const useProductDropdown = () => {
  return useMutation({
    mutationFn: () => getProductDropdownApi(),
  });
};
