import { useQuery } from "@tanstack/react-query";
import { Settings } from "../../interfaces/setting.interface";
import { getSettings } from "../../api/setting.api";

export const useSettings = () => {
  return useQuery<Settings[]>({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await getSettings();
      return response;
    },
  });
};
