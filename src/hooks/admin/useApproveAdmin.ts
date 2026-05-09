import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { approveUserApi } from "../../api/admin.api";

export const useApproveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantId: string) =>
      approveUserApi(tenantId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

