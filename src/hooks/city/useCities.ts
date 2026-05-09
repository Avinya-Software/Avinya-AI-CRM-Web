import { useMutation, useQuery } from "@tanstack/react-query";
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

export const useCitiesQuery = (stateId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["cities", stateId],
    queryFn: () => getCities(stateId).then(res => res.data),
    enabled: enabled && !!stateId,
  });
};
