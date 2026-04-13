import { useMutation } from "@tanstack/react-query";
import { getLeadLifecycleReport, getLeadPipelineReport } from "../../api/report.api";
import { LeadPipelineFilter } from "../../interfaces/report.interface";

export const useLeadPipelineReport = () => {
  return useMutation({
    mutationFn: (filter: LeadPipelineFilter) => getLeadPipelineReport(filter),
  });
};

export const useLeadLifecycleReport = () => {
  return useMutation({
    mutationFn: (filter: LeadPipelineFilter) => getLeadLifecycleReport(filter),
  });
};
