import { useQuery } from "@tanstack/react-query";
import { getLeadStatusesApi } from "../../api/lead.api";

export const useLeadStatuses = () =>
  useQuery({
    queryKey: ["lead-statuses"],
    queryFn: async () => {
      const res = await getLeadStatusesApi();

      // ⭐ normalize shape
      return res.map((s: any) => ({
        id: s.leadStatusID,
        name: s.statusName,
      }));
    },
  });