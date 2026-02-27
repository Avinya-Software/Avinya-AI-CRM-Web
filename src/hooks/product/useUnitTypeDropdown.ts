import { useQuery } from "@tanstack/react-query";
import { getUnitDropDownApi } from "../../api/product.api";


export const useUnitTypeDropdown = () => {
  return useQuery({
    queryKey: ["unitTypes"],
    queryFn: () => getUnitDropDownApi(),
  });
};
