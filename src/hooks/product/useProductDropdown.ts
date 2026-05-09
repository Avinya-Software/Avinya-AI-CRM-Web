import { useMutation, useQuery } from "@tanstack/react-query";
import { getProductDropdownApi } from "../../api/product.api";

export const useProductDropdown = () => {
  return useMutation({
    mutationFn: () => getProductDropdownApi(),
  });
};

export const useProductDropdownQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["product-dropdown"],
    queryFn: () => getProductDropdownApi(),
    enabled,
  });
};
