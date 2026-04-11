import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { approveUserApi } from "../../api/admin.api";

export const useApproveUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantId: string) =>
      approveUserApi(tenantId),

    onSuccess: (response: any) => {
      toast.success(response?.statusMessage || "Admin approved successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.statusMessage || err?.response?.data?.message || "Failed to approve admin"
      );
    },
  });
};

