import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClientApi } from "../../api/client.api";

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClientApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
};