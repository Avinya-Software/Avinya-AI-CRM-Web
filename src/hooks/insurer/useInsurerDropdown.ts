import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getInsurerDropdownApi } from "../../api/insurer.api";

export const useInsurerDropdown = () => {
  return useQuery({
    queryKey: ["insurer-dropdown"],
    queryFn: getInsurerDropdownApi,
  });
};

export const useInsurerDropdownMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: getInsurerDropdownApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["insurer-dropdown"],
      });
    },
  });
};
