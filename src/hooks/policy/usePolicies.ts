import { useMutation } from "@tanstack/react-query";
import { getPoliciesApi } from "../../api/policy.api";

export interface PolicyFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

export const usePolicies = () => {
  return useMutation({
    mutationFn: (filters: PolicyFilters) => getPoliciesApi(filters),
  });
};
