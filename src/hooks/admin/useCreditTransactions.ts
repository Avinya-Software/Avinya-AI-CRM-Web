import { useMutation } from "@tanstack/react-query";
import { getCreditTransactionsApi } from "../../api/credit.api";

export const useCreditTransactions = () => {
  return useMutation({
    mutationFn: ({
      userId,
      pageNumber,
      pageSize,
    }: {
      userId: string;
      pageNumber: number;
      pageSize: number;
    }) => getCreditTransactionsApi(userId, pageNumber, pageSize),
  });
};
