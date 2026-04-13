import { useMutation } from "@tanstack/react-query";
import { getLeadSourcesApi } from "../../api/lead.api";

export const useLeadSources = () =>
  useMutation({
    mutationFn: async () => {
      const res = await getLeadSourcesApi();
      return res.map((s: any) => ({
        id: s.leadSourceID,
        name: s.sourceName,
      }));
    },
  });
