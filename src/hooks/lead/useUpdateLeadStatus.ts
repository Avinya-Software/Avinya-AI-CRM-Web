import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateLeadStatusApi } from "../../api/lead.api";

interface UpdateLeadStatusPayload {
  leadId: string;
  statusId: number;
  notes?: string;
}

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      leadId,
      statusId,
      notes,
    }: UpdateLeadStatusPayload) =>
      updateLeadStatusApi(leadId, statusId, notes),

    onSuccess: () => {
      // 🔥 RE-FETCH LEADS AFTER STATUS CHANGE
      queryClient.invalidateQueries({
        queryKey: ["leads"],
      });
    },
  });
};
