import { useQuery } from "@tanstack/react-query";
import { getLeadSourcesApi } from "../../api/lead.api";

export const useLeadSources = () =>
  useQuery({
    queryKey: ["lead-sources"],
    queryFn: async () => {
      const res = await getLeadSourcesApi();

      return res.map((s: any) => ({
        id: s.leadSourceID,
        name: s.sourceName,
      }));
    },
  });