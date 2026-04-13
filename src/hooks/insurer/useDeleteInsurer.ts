import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteInsurerApi } from "../../api/insurer.api";

export const useDeleteInsurer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (insurerId: string) =>
      deleteInsurerApi(insurerId),

    onSuccess: (response: any) => {
      toast.success(response?.statusMessage || "Insurer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["insurers"] });
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.statusMessage || err?.response?.data?.message || "Failed to delete insurer"
      );
    },
  });
};
