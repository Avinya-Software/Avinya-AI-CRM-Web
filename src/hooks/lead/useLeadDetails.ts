import { useQuery } from "@tanstack/react-query";
import { getLeadByIdApi } from "../../api/lead.api";

export const useLeadDetails = (leadId: string | null) => {
  return useQuery({
    queryKey: ["lead-detail", leadId],
    queryFn: () => getLeadByIdApi(leadId!),
    enabled: !!leadId,
  });
};
