import { useMutation } from "@tanstack/react-query";
import { getClaimsApi } from "../../api/claim.api";
import type { ClaimFilters } from "../../interfaces/claim.interface";

export const useClaims = () => {
  return useMutation({
    mutationFn: (filters: ClaimFilters) => getClaimsApi(filters),
  });
};
