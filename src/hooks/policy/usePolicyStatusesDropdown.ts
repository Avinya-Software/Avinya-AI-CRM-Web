import { useMutation } from "@tanstack/react-query";
import { getPolicyStatusesDropdownApi } from "../../api/policy.api";

export const usePolicyStatusesDropdown = () => {
  return useMutation({
    mutationFn: () => getPolicyStatusesDropdownApi(),
  });
};
