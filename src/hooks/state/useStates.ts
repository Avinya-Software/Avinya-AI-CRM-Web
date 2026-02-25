import { useQuery } from "@tanstack/react-query";
import { getstates } from "../../api/state.api";
import { States } from "../../interfaces/state.interface";

export const useStates = () => {
  return useQuery<States[]>({
    queryKey: ["states"],
    queryFn: async () => {
      const response = await getstates();
      return response;
    },
  });
};
