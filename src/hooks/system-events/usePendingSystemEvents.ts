import { useMutation } from "@tanstack/react-query";
import { getPendingSystemEventsApi } from "../../api/systemEvent.api";

export const usePendingSystemEvents = () => {
  return useMutation({
    mutationFn: () => getPendingSystemEventsApi(),
  });
};
