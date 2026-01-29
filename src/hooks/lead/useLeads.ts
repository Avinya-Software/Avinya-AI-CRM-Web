import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getLeadsApi } from "../../api/lead.api";
import type { LeadFilters } from "../../interfaces/lead.interface";
import type { LeadListResponse } from "../../interfaces/lead.interface";

export const useLeads = (filters: LeadFilters) => {
  return useQuery<LeadListResponse>({
    queryKey: ["leads", filters],
    queryFn: () => getLeadsApi(filters),
    placeholderData: keepPreviousData,
  });
};
