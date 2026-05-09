import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdvisorApi } from "../../api/admin.api";

export const useDeleteAdvisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      deleteAdvisorApi(userId),

    onSuccess: () => {
      // Refresh both lists to be safe
      queryClient.invalidateQueries({ queryKey: ["pending-advisors"] });
      queryClient.invalidateQueries({ queryKey: ["pending-companies"] });
    }
  });
};
