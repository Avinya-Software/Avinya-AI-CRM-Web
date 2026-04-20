import { useMutation } from "@tanstack/react-query";
import { getCreditUsersApi } from "../../api/credit.api";
import type { CreditListRequest } from "../../interfaces/credit.interface";

export const useUserCredits = () => {
  return useMutation({
    mutationFn: (payload: CreditListRequest) => getCreditUsersApi(payload),
  });
};
