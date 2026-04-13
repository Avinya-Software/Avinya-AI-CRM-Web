import { useMutation } from "@tanstack/react-query";
import { getPendingCompaniesApi } from "../../api/admin.api";

export const usePendingCompanies = () => {
  return useMutation({
    mutationFn: () => getPendingCompaniesApi(),
  });
};
