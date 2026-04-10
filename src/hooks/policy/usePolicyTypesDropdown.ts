import { useMutation } from "@tanstack/react-query";
import { getPolicyTypesDropdownApi } from "../../api/policy.api";

export const usePolicyTypesDropdown = () => {
  return useMutation({
    mutationFn: () => getPolicyTypesDropdownApi(),
  });
};
