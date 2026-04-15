import { useQuery } from "@tanstack/react-query";
import { getLeadLifecycleReport, getLeadPipelineReport } from "../../api/report.api";
import { LeadPipelineFilter } from "../../interfaces/report.interface";

export const useLeadPipelineReport = (filters: LeadPipelineFilter) => {
  return useQuery({
    queryKey: ["lead-pipeline-report", filters],
    queryFn: () => getLeadPipelineReport(filters),
  });
};

export const useLeadLifecycleReport = (filters: LeadPipelineFilter) => {
  return useQuery({
    queryKey: ["lead-lifecycle-report", filters],
    queryFn: () => getLeadLifecycleReport(filters),
  });
};
