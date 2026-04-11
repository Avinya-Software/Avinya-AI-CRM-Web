import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteCustomerApi } from "../../api/customer.api";

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) =>
      deleteCustomerApi(customerId),

    onSuccess: (response: any) => {
      toast.success(response?.statusMessage || "Customer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.statusMessage || err?.response?.data?.message || "Failed to delete customer"
      );
    },
  });
};
