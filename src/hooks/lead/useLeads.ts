import { useQuery } from "@tanstack/react-query";
import { getLeadsApi } from "../../api/lead.api";
import type { LeadFilters, LeadListResponse } from "../../interfaces/lead.interface";

export const useLeads = (filters: LeadFilters) => {
  return useQuery<LeadListResponse, Error>({
    queryKey: ["leads", filters],
    queryFn: () => getLeadsApi(filters),
  });
};
