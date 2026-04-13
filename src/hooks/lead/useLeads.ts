import { useMutation } from "@tanstack/react-query";
import { getLeadsApi } from "../../api/lead.api";
import type { LeadFilters, LeadListResponse } from "../../interfaces/lead.interface";

export const useLeads = () => {
  return useMutation<LeadListResponse, Error, LeadFilters>({
    mutationFn: (filters: LeadFilters) => getLeadsApi(filters),
  });
};
