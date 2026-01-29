import { useQuery } from "@tanstack/react-query";
import { getProductDropdownApi } from "../../api/product.api";

export const useProductDropdown = (insurerId?: string) => {
  return useQuery({
    queryKey: ["product-dropdown", insurerId],
    queryFn: () => getProductDropdownApi(insurerId),
    enabled: true, //  API runs ONLY after insurer selected
  });
};
