import { useQuery } from "@tanstack/react-query";
import { getProductDropdownApi } from "../../api/product.api";

export const useProductDropdown = () => {
  return useQuery({
    queryKey: ["product-dropdown"],
    queryFn: () => getProductDropdownApi(),
  });
};
