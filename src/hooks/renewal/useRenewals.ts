import { useMutation } from "@tanstack/react-query";
import { getRenewalsApi } from "../../api/renewal.api";

interface Params {
  pageNumber: number;
  pageSize: number;
  search?: string;
  renewalStatusId?: number;
}

export const useRenewals = () => {
  return useMutation({
    mutationFn: (params: Params) => getRenewalsApi(params),
  });
};
