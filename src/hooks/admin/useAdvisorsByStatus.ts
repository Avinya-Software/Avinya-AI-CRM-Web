import { useMutation } from "@tanstack/react-query";
import { getAdvisorsByStatusApi } from "../../api/admin.api";

interface Params {
  status: "approved" | "rejected";
  fromDate?: string;
  toDate?: string;
}

export const useAdvisorsByStatus = () => {
  return useMutation({
    mutationFn: (params: Params) =>
      getAdvisorsByStatusApi(params.status, params.fromDate, params.toDate),
  });
};
