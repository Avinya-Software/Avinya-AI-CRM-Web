import { useMutation, useQuery } from "@tanstack/react-query";
import { getstates } from "../../api/state.api";
import { States } from "../../interfaces/state.interface";

export const useStates = () => {
  return useMutation<States[], Error, void>({
    mutationFn: async () => {
      const response = await getstates();
      return response;
    },
  });
};

export const useStatesQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["states"],
    queryFn: () => getstates(),
    enabled,
  });
};
