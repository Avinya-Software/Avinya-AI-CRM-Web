import { useMutation } from "@tanstack/react-query";
import { getCustomersApi } from "../../api/customer.api";
import type { CustomerPagedResponse } from "../../interfaces/customer.interface";

export const useCustomers = () => {
  return useMutation<CustomerPagedResponse, Error, { pageNumber: number; pageSize: number; search?: string }>({
    mutationFn: (params) =>
      getCustomersApi(params),
  });
};
