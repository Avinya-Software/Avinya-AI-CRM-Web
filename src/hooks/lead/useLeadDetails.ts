import { useMutation } from "@tanstack/react-query";
import { getLeadByIdApi } from "../../api/lead.api";

export const useLeadDetails = () => {
  return useMutation({
    mutationFn: (leadId: string) => getLeadByIdApi(leadId),
  });
};
