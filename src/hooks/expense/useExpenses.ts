// src/hooks/expense/useExpenses.ts
import { useQuery } from "@tanstack/react-query";
import { getExpensesApi } from "../../api/expense.api";

interface UseExpensesParams {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
}

export const useExpenses = (params: UseExpensesParams) => {
  return useQuery({
    queryKey: ["expenses", params],
    queryFn: () => getExpensesApi(params),
    // keepPreviousData: true,
  });
};