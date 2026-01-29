import { useQuery } from "@tanstack/react-query";
import { getCustomerDropdownApi } from "../../api/customer.api";
import type { CustomerDropdown } from "../../interfaces/customer.interface";

export const useCustomerDropdown = () => {
  return useQuery<CustomerDropdown[]>({
    queryKey: ["customer-dropdown"],
    queryFn: getCustomerDropdownApi,
  });
};
