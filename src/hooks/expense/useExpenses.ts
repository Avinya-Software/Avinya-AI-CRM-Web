// src/hooks/expense/useExpenses.ts
import { useMutation } from "@tanstack/react-query";
import { getExpensesApi } from "../../api/expense.api";

interface UseExpensesParams {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
}

export const useExpenses = () => {
  return useMutation({
    mutationFn: (params: UseExpensesParams) => getExpensesApi(params),
  });
};
