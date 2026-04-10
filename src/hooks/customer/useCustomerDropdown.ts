import { useMutation } from "@tanstack/react-query";
import { getCustomerDropdownApi } from "../../api/customer.api";
import type { CustomerDropdown } from "../../interfaces/customer.interface";

export const useCustomerDropdown = () => {
  return useMutation<CustomerDropdown[], Error, void>({
    mutationFn: () => getCustomerDropdownApi(),
  });
};
