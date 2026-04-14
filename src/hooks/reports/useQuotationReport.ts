import { useMutation } from "@tanstack/react-query";
import { getQuotationReport, getQuotationLifecycleReport } from "../../api/report.api";
import { QuotationReportFilter } from "../../interfaces/report.interface";

export const useQuotationReport = () => {
  return useMutation({
    mutationFn: (filter: QuotationReportFilter) => getQuotationReport(filter),
  });
};

export const useQuotationLifecycleReport = () => {
  return useMutation({
    mutationFn: (filter: QuotationReportFilter) => getQuotationLifecycleReport(filter),
  });
};
