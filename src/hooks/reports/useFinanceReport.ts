import { useMutation } from "@tanstack/react-query";
import { getFinanceReport } from "../../api/report.api";
import { FinanceReportFilter } from "../../interfaces/report.interface";

export const useFinanceReport = () => {
  return useMutation({
    mutationFn: (filter: FinanceReportFilter) => getFinanceReport(filter),
  });
};
