import { useQuery } from "@tanstack/react-query";
import { Cities } from "../../interfaces/city.interface";
import { getCities } from "../../api/city.api";

export const useCities = (stateId: number) => {
  return useQuery<Cities[]>({
    queryKey: ["cities", stateId],
    queryFn: async () => {
      const response = await getCities(stateId);
      return response.data;
    },
  });
};
