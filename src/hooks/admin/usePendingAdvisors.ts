import { useMutation } from "@tanstack/react-query";
import { getPendingAdvisorsApi } from "../../api/admin.api";

export const usePendingAdvisors = () => {
  return useMutation({
    mutationFn: () => getPendingAdvisorsApi(),
  });
};
