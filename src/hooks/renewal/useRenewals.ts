import { useQuery } from "@tanstack/react-query";
import { getRenewalsApi } from "../../api/renewal.api";

interface Params {
  pageNumber: number;
  pageSize: number;
  search?: string;
  renewalStatusId?: number;
}

export const useRenewals = (params: Params) => {
  return useQuery({
    queryKey: ["renewals", params],
    queryFn: () => getRenewalsApi(params),
  });
};
