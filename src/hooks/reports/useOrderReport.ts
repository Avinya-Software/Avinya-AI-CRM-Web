import { useMutation } from "@tanstack/react-query";
import { getOrderReport, getOrderLifecycleReport } from "../../api/report.api";
import { OrderReportFilter } from "../../interfaces/report.interface";

export const useOrderReport = () => {
  return useMutation({
    mutationFn: (filter: OrderReportFilter) => getOrderReport(filter),
  });
};

export const useOrderLifecycleReport = () => {
  return useMutation({
    mutationFn: (filter: OrderReportFilter & { pageNumber?: number; pageSize?: number }) => 
      getOrderLifecycleReport(filter),
  });
};
