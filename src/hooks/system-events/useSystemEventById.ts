import { useQuery } from "@tanstack/react-query";
import { getSystemEventByIdApi } from "../../api/systemEvent.api";

export const useSystemEventById = (eventId: string) => {
  return useQuery({
    queryKey: ["system-events", eventId],
    queryFn: () => getSystemEventByIdApi(eventId),
    enabled: !!eventId,
  });
};
