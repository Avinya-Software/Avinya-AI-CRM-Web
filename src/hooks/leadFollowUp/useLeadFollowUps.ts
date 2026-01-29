import { useQuery } from "@tanstack/react-query";
import { getFollowUpsByLeadId } from "../../api/leadFollowUp.api";
import type { LeadFollowUp } from "../../interfaces/leadFollowUp.interface";

export const useLeadFollowUps = (leadId: string | null) => {
  return useQuery<LeadFollowUp[]>({
    queryKey: ["lead-followups", leadId],
    queryFn: () => getFollowUpsByLeadId(leadId!),
    enabled: !!leadId,
  });
};
