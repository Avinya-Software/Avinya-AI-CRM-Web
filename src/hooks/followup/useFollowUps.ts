// src/hooks/followup/useFollowUps.ts

import { useQuery } from "@tanstack/react-query";
import { getLeadFollowUps } from "../../api/followup.api";

// ── Fetch follow-ups for a lead ────────────────────────────────────
export const useLeadFollowUps = (leadId: string | null) => {
  return useQuery({
    queryKey: ["lead-followups", leadId],
    queryFn: () => getLeadFollowUps(leadId!),
    enabled: !!leadId,
    staleTime: 30000,
  });
};