import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertRenewalApi } from "../../api/renewal.api";
// import toast from "react-hot-toast";

export const useUpsertRenewal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertRenewalApi,
    onSuccess: () => {
      // toast.success("Renewal saved successfully");
      queryClient.invalidateQueries({ queryKey: ["renewals"] });
    },
  });
};
