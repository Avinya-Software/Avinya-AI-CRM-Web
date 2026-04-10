import { useMutation } from "@tanstack/react-query";
import { getUnitDropDownApi } from "../../api/product.api";

export const useUnitTypeDropdown = () => {
  return useMutation({
    mutationFn: () => getUnitDropDownApi(),
  });
};
