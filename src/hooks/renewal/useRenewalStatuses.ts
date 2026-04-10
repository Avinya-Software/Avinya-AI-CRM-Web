import { useMutation } from "@tanstack/react-query";
import { getRenewalStatusesApi } from "../../api/renewal.api";

export const useRenewalStatuses = () => {
  return useMutation({
    mutationFn: () => getRenewalStatusesApi(),
  });
};
