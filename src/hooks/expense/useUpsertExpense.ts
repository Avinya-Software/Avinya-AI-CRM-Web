// src/hooks/expense/useUpsertExpense.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpenseApi, updateExpenseApi } from "../../api/expense.api";
import { ExpenseUpsertPayload } from "../../interfaces/expense.interface";

export const useUpsertExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ExpenseUpsertPayload) => {
      if (payload.expenseID) {
        return updateExpenseApi(payload.expenseID, payload);
      }
      return createExpenseApi(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};