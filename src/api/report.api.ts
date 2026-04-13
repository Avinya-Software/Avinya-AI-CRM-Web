import axiosInstance from "./axios";
import { 
  LeadLifecycleReportItem, 
  LeadPipelineFilter, 
  LeadPipelineReportData, 
  ReportResponse,
  ClientReportFilter,
  ClientRevenueReportData
} from "../interfaces/report.interface";

export const getLeadPipelineReport = async (filter: LeadPipelineFilter) => {
  const params = new URLSearchParams();
  if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.append("dateTo", filter.dateTo);
  if (filter.leadSourceId) params.append("leadSourceId", filter.leadSourceId);
  if (filter.leadStatusId) params.append("leadStatusId", filter.leadStatusId);
  if (filter.assignedTo) params.append("assignedTo", filter.assignedTo);

  const response = await axiosInstance.get<ReportResponse<LeadPipelineReportData>>(
    `/Report/lead-pipeline?${params.toString()}`
  );
  return response.data;
};

export const getLeadLifecycleReport = async (filter: LeadPipelineFilter) => {
  const params = new URLSearchParams();
  if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.append("dateTo", filter.dateTo);
  if (filter.leadSourceId) params.append("leadSourceId", filter.leadSourceId);
  if (filter.leadStatusId) params.append("leadStatusId", filter.leadStatusId);
  if (filter.assignedTo) params.append("assignedTo", filter.assignedTo);
  if (filter.pageNumber) params.append("pageNumber", filter.pageNumber.toString());
  if (filter.pageSize) params.append("pageSize", filter.pageSize.toString());

  const response = await axiosInstance.get<ReportResponse<LeadLifecycleReportItem[]>>(
    `/Report/lead-lifecycle?${params.toString()}`
  );
  return response.data;
};

export const getClientRevenueReport = async (filter: ClientReportFilter) => {
  const params = new URLSearchParams();
  if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.append("dateTo", filter.dateTo);
  if (filter.clientId) params.append("clientId", filter.clientId);
  if (filter.clientType) params.append("clientType", filter.clientType.toString());
  if (filter.stateId) params.append("stateId", filter.stateId.toString());

  const response = await axiosInstance.get<ReportResponse<ClientRevenueReportData>>(
    `/Report/client-revenue?${params.toString()}`
  );
  return response.data;
};
