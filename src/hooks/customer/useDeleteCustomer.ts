import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteCustomerApi } from "../../api/customer.api";

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) =>
      deleteCustomerApi(customerId),

    onSuccess: () => {
      toast.success("Customer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to delete customer"
      );
    },
  });
};
