import { useQuery } from "@tanstack/react-query";
import { getPendingAdvisorsApi } from "../../api/admin.api";

export const usePendingAdvisors = () => {
  return useQuery({
    queryKey: ["pending-advisors"],
    queryFn: getPendingAdvisorsApi
  });
};
