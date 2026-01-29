import { useQuery } from "@tanstack/react-query";
import { getPolicyTypesDropdownApi } from "../../api/policy.api";

export const usePolicyTypesDropdown = () => {
  return useQuery({
    queryKey: ["policy-types-dropdown"],
    queryFn: getPolicyTypesDropdownApi,
  });
};
