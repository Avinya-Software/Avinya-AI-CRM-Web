import { useQuery } from "@tanstack/react-query";
import { getLeadSourcesApi } from "../../api/lead.api";

export const useLeadSources = () => {
  return useQuery({
    queryKey: ["lead-sources"],
    queryFn: getLeadSourcesApi,
  });
};
