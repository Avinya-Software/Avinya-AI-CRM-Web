// src/hooks/followup/useLeadFollowupStatuses.ts
import { useQuery } from "@tanstack/react-query";
import { getLeadFollowupStatuses, LeadFollowupStatusOption } from "../../api/followup.api";

/**
 * Fetches lead follow-up statuses from the API.
 * Results are cached for 10 minutes — statuses rarely change.
 *
 * Usage:
 *   const { data: statuses = [], isLoading } = useLeadFollowupStatuses();
 */
export const useLeadFollowupStatuses = () => {
  return useQuery<LeadFollowupStatusOption[]>({
    queryKey: ["lead-followup-statuses"],
    queryFn: getLeadFollowupStatuses,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};
