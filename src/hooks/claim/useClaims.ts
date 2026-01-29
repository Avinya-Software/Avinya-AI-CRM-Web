import { useQuery } from "@tanstack/react-query";
import { getClaimsApi } from "../../api/claim.api";
import type { ClaimFilters } from "../../interfaces/claim.interface";

export const useClaims = (filters: ClaimFilters) => {
  return useQuery({
    queryKey: ["claims", filters],
    queryFn: () => getClaimsApi(filters),
  });
};
