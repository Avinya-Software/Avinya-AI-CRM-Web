import { useQuery } from "@tanstack/react-query";
import { getPolicyStatusesDropdownApi } from "../../api/policy.api";

export const usePolicyStatusesDropdown = () => {
  return useQuery({
    queryKey: ["policy-statuses-dropdown"],
    queryFn: getPolicyStatusesDropdownApi,
  });
};
