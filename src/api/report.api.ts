import axiosInstance from "./axios";
import { 
  LeadLifecycleReportItem, 
  LeadPipelineFilter, 
  LeadPipelineReportData, 
  ReportResponse,
  ClientReportFilter,
  ClientRevenueReportData,
  QuotationReportData,
  QuotationReportFilter,
  QuotationLifecycleReportItem,
  QuotationLifecycleReportData
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
  if (filter.pageNumber) params.append("pageNumber", filter.pageNumber.toString());
  if (filter.pageSize) params.append("pageSize", filter.pageSize.toString());

  const response = await axiosInstance.get<ReportResponse<ClientRevenueReportData>>(
    `/Report/client-revenue?${params.toString()}`
  );
  return response.data;
};

export const getClientDrillDown = async (clientId: string) => {
  const response = await axiosInstance.get<ReportResponse<any>>(
    `/Report/client-drilldown/${clientId}`
  );
  return response.data;
};

export const getQuotationReport = async (filter: QuotationReportFilter) => {
  const params = new URLSearchParams();
  if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.append("dateTo", filter.dateTo);
  if (filter.quotationStatusId) params.append("quotationStatusId", filter.quotationStatusId);
  if (filter.clientId) params.append("clientId", filter.clientId);
  if (filter.createdBy) params.append("createdBy", filter.createdBy);
  if (filter.firmId !== undefined && filter.firmId !== null) params.append("firmId", filter.firmId.toString());

  const response = await axiosInstance.get<ReportResponse<QuotationReportData>>(
    `/Report/quotation?${params.toString()}`
  );
  return response.data;
};

export const getQuotationLifecycleReport = async (filter: QuotationReportFilter) => {
  const params = new URLSearchParams();
  if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.append("dateTo", filter.dateTo);
  if (filter.quotationStatusId) params.append("quotationStatusId", filter.quotationStatusId);
  if (filter.clientId) params.append("clientId", filter.clientId);
  if (filter.createdBy) params.append("createdBy", filter.createdBy);
  if (filter.firmId !== undefined && filter.firmId !== null) params.append("firmId", filter.firmId.toString());
  if (filter.pageNumber) params.append("pageNumber", filter.pageNumber.toString());
  if (filter.pageSize) params.append("pageSize", filter.pageSize.toString());

  const response = await axiosInstance.get<ReportResponse<QuotationLifecycleReportItem[]>>(
    `/Report/quotation-lifecycle?${params.toString()}`
  );
  return response.data;
};
