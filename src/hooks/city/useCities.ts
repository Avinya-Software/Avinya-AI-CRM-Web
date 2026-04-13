import { useMutation } from "@tanstack/react-query";
import { Cities } from "../../interfaces/city.interface";
import { getCities } from "../../api/city.api";

export const useCities = () => {
  return useMutation<Cities[], Error, number>({
    mutationFn: async (stateId: number) => {
      const response = await getCities(stateId);
      return response.data;
    },
  });
};
