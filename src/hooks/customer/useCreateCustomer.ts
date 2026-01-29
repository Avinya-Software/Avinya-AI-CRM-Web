import { useMutation, useQueryClient  } from "@tanstack/react-query";
import { createCustomerApi } from "../../api/customer.api";
import type { CreateCustomerRequest } from "../../interfaces/customer.interface";

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) =>
      createCustomerApi(data),
     onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
    },
  });
};
