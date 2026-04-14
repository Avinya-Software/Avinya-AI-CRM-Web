import { useMutation } from "@tanstack/react-query";
import { getClientRevenueReport, getClientDrillDown } from "../../api/report.api";
import { ClientReportFilter } from "../../interfaces/report.interface";

export const useClientRevenueReport = () => {
  return useMutation({
    mutationFn: (filter: ClientReportFilter) => getClientRevenueReport(filter),
  });
};

export const useClientDrillDown = () => {
  return useMutation({
    mutationFn: (clientId: string) => getClientDrillDown(clientId),
  });
};
