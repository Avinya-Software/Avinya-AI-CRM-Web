import { useMutation, useQuery } from "@tanstack/react-query";
import { getUnitDropDownApi } from "../../api/product.api";

export const useUnitTypeDropdown = () => {
  return useMutation({
    mutationFn: () => getUnitDropDownApi(),
  });
};

export const useUnitTypeDropdownQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["unit-type-dropdown"],
    queryFn: () => getUnitDropDownApi(),
    enabled,
  });
};
