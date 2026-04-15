import { useMutation } from "@tanstack/react-query";
import { getTaskProjectReport } from "../../api/report.api";
import { TaskProjectReportFilter } from "../../interfaces/report.interface";

export const useTaskProjectReport = () => {
  return useMutation({
    mutationFn: (filter: TaskProjectReportFilter) => getTaskProjectReport(filter),
  });
};
