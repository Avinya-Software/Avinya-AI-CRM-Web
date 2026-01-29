import { useQuery } from "@tanstack/react-query";
import { getPoliciesApi } from "../../api/policy.api";

export interface PolicyFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

export const usePolicies = (filters: PolicyFilters) => {
  return useQuery({
    queryKey: ["policies", filters],
    queryFn: () => getPoliciesApi(filters),
  });
};
