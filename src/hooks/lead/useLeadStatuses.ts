import { useMutation, useQuery } from "@tanstack/react-query";
import { getLeadStatusesApi } from "../../api/lead.api";

export const useLeadStatuses = () =>
  useMutation({
    mutationFn: async () => {
      const res = await getLeadStatusesApi();
      return res.map((s: any) => ({
        id: s.leadStatusID,
        name: s.statusName,
      }));
    },
  });

export const useLeadStatusesQuery = (enabled: boolean = true) =>
  useQuery({
    queryKey: ["leadStatuses"],
    queryFn: async () => {
      const res = await getLeadStatusesApi();
      return res.map((s: any) => ({
        id: s.leadStatusID,
        name: s.statusName,
      }));
    },
    enabled,
  });
