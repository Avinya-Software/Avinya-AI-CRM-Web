// src/hooks/followup/useFollowUps.ts

import { useMutation } from "@tanstack/react-query";
import { getLeadFollowUps } from "../../api/followup.api";

// ── Fetch follow-ups for a lead ────────────────────────────────────
export const useLeadFollowUps = () => {
  return useMutation({
    mutationFn: (leadId: string) => getLeadFollowUps(leadId),
  });
};
