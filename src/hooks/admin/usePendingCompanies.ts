import { useQuery } from "@tanstack/react-query";
import { getPendingCompaniesApi } from "../../api/admin.api";

export const usePendingCompanies = () => {
  return useQuery({
    queryKey: ["pending-companies"],
    queryFn: () => getPendingCompaniesApi(),
    refetchInterval: 30000, // Poll every 30 seconds
  });
};
