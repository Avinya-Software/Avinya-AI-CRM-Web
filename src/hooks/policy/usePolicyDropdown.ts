import { useMutation } from "@tanstack/react-query";
import { getPolicyDropdownApi } from "../../api/policy.api";

export const usePolicyDropdown = () => {
  return useMutation({
    mutationFn: (customerId?: string) => getPolicyDropdownApi(customerId),
  });
};
