import { useQuery } from "@tanstack/react-query";
import { getLeadStatusesApi } from "../../api/lead.api";

export const useLeadStatuses = () => {
  return useQuery({
    queryKey: ["lead-statuses"],
    queryFn: getLeadStatusesApi,
  });
};
