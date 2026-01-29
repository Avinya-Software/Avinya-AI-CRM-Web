import { useQuery } from "@tanstack/react-query";
import { getAdvisorsByStatusApi } from "../../api/admin.api";

interface Params {
  status: "approved" | "rejected";
  fromDate?: string;
  toDate?: string;
}

export const useAdvisorsByStatus = ({
  status,
  fromDate,
  toDate
}: Params) => {
  return useQuery({
    queryKey: ["advisors-by-status", status, fromDate, toDate],
    queryFn: () =>
      getAdvisorsByStatusApi(status, fromDate, toDate),
    enabled: !!status
  });
};
