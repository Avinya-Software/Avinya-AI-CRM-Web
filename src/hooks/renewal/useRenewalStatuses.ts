import { useQuery } from "@tanstack/react-query";
import { getRenewalStatusesApi } from "../../api/renewal.api";

export const useRenewalStatuses = () => {
  return useQuery({
    queryKey: ["renewal-statuses"],
    queryFn: getRenewalStatusesApi,
  });
};
