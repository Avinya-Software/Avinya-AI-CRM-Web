import { useMutation } from "@tanstack/react-query";
import { getFollowUpsByLeadId } from "../../api/leadFollowUp.api";
import { LeadFollowUp } from "../../interfaces/lead.interface";

export const useLeadFollowUps = () => {
  return useMutation<LeadFollowUp[], Error, string>({
    mutationFn: (leadId: string) => getFollowUpsByLeadId(leadId),
  });
};
