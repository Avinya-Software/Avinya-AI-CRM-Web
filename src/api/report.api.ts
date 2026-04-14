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
  QuotationLifecycleReportData,
  OrderReportFilter,
  OrderReportData,
  OrderLifecycleReportData,
  FinanceReportFilter,
  FinanceReportData
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
  if (filter.invoiceStatusId) params.append("invoiceStatusId", filter.invoiceStatusId.toString());
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

export const getOrderReport = async (filter: OrderReportFilter) => {
  const params = new URLSearchParams();
  if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.append("dateTo", filter.dateTo);
  if (filter.orderStatusId !== undefined && filter.orderStatusId !== null) params.append("orderStatusId", filter.orderStatusId.toString());
  if (filter.designStatusId !== undefined && filter.designStatusId !== null) params.append("designStatusId", filter.designStatusId.toString());
  if (filter.clientId) params.append("clientId", filter.clientId);
  if (filter.assignedDesignTo) params.append("assignedDesignTo", filter.assignedDesignTo);
  if (filter.firmId !== undefined && filter.firmId !== null) params.append("firmId", filter.firmId.toString());
  if (filter.overdueOnly !== undefined && filter.overdueOnly !== null) params.append("overdueOnly", filter.overdueOnly.toString());

  const response = await axiosInstance.get<ReportResponse<OrderReportData>>(
    `/Report/order?${params.toString()}`
  );
  return response.data;
};

export const getOrderLifecycleReport = async (filter: OrderReportFilter & { pageNumber?: number; pageSize?: number }) => {
  const params = new URLSearchParams();
  if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.append("dateTo", filter.dateTo);
  if (filter.orderStatusId !== undefined && filter.orderStatusId !== null) params.append("orderStatusId", filter.orderStatusId.toString());
  if (filter.designStatusId !== undefined && filter.designStatusId !== null) params.append("designStatusId", filter.designStatusId.toString());
  if (filter.clientId) params.append("clientId", filter.clientId);
  if (filter.assignedDesignTo) params.append("assignedDesignTo", filter.assignedDesignTo);
  if (filter.firmId !== undefined && filter.firmId !== null) params.append("firmId", filter.firmId.toString());
  if (filter.pageNumber) params.append("pageNumber", filter.pageNumber.toString());
  if (filter.pageSize) params.append("pageSize", filter.pageSize.toString());

  const response = await axiosInstance.get<ReportResponse<OrderLifecycleReportData>>(
    `/Report/order-lifecycle?${params.toString()}`
  );
  return response.data;
};

export const getFinanceReport = async (filter: FinanceReportFilter) => {
  const params = new URLSearchParams();
  if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.append("dateTo", filter.dateTo);
  if (filter.invoiceStatusId !== undefined && filter.invoiceStatusId !== null) params.append("invoiceStatusId", filter.invoiceStatusId.toString());
  if (filter.clientId) params.append("clientId", filter.clientId);
  if (filter.expenseCategoryId !== undefined && filter.expenseCategoryId !== null) params.append("expenseCategoryId", filter.expenseCategoryId.toString());
  if (filter.paymentMode) params.append("paymentMode", filter.paymentMode);
  if (filter.overdueOnly !== undefined && filter.overdueOnly !== null) params.append("overdueOnly", filter.overdueOnly.toString());

  const response = await axiosInstance.get<ReportResponse<FinanceReportData>>(
    `/Report/finance?${params.toString()}`
  );
  return response.data;
};
