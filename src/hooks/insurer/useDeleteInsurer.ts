import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteInsurerApi } from "../../api/insurer.api";

export const useDeleteInsurer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (insurerId: string) =>
      deleteInsurerApi(insurerId),

    onSuccess: () => {
      toast.success("Insurer deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["insurers"] });
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to delete insurer"
      );
    },
  });
};
