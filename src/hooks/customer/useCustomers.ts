import { useQuery } from "@tanstack/react-query";
import { getCustomersApi } from "../../api/customer.api";
import type { CustomerPagedResponse } from "../../interfaces/customer.interface";

export const useCustomers = (
  pageNumber: number,
  pageSize: number,
  search?: string
) => {
  return useQuery<CustomerPagedResponse>({
    queryKey: ["customers", pageNumber, pageSize, search],
    queryFn: () =>
      getCustomersApi({
        pageNumber,
        pageSize,
        search,
      }),
  });
};
