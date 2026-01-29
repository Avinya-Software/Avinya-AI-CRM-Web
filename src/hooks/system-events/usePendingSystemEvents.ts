import { useQuery } from "@tanstack/react-query";
import { getPendingSystemEventsApi } from "../../api/systemEvent.api";

export const usePendingSystemEvents = () => {
  return useQuery({
    queryKey: ["system-events", "pending"],
    queryFn: getPendingSystemEventsApi,
  });
};
