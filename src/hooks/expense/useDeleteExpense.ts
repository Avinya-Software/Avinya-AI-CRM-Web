// src/hooks/expense/useDeleteExpense.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExpenseApi } from "../../api/expense.api";

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpenseApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};