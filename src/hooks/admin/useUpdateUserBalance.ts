import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserBalanceApi } from "../../api/credit.api";
import toast from "react-hot-toast";

export const useUpdateUserBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, amount }: { userId: string; amount: number }) =>
      updateUserBalanceApi(userId, amount),
    onSuccess: () => {
      toast.success("Balance updated successfully");
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["users-credits"] });
      queryClient.invalidateQueries({ queryKey: ["credit-transactions"] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.statusMessage || "Failed to update balance";
      toast.error(msg);
    },
  });
};
