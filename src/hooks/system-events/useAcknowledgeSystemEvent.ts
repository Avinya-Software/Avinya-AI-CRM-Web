import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acknowledgeSystemEventApi } from "../../api/systemEvent.api";

export const useAcknowledgeSystemEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) =>
      acknowledgeSystemEventApi(eventId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["system-events"],
      });
    },
  });
};
