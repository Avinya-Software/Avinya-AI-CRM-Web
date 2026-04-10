import { useMutation } from "@tanstack/react-query";
import { getSystemEventByIdApi } from "../../api/systemEvent.api";

export const useSystemEventById = () => {
  return useMutation({
    mutationFn: (eventId: string) => getSystemEventByIdApi(eventId),
  });
};
