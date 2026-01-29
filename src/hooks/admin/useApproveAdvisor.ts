import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveAdvisorApi } from "../../api/admin.api";

export const useApproveAdvisor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      approveAdvisorApi(userId),

    onSuccess: () => {
      //  Refresh pending advisors list
      queryClient.invalidateQueries({
        queryKey: ["pending-advisors"]
      });
    }
  });
};
