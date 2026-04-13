export interface LeadKPI {
  totalLeads: number;
  convertedLeads: number;
  lostLeads: number;
  openLeads: number;
  conversionRate: number;
  lossRate: number;
  avgFollowUps: number;
}

export interface FunnelStage {
  statusName: string;
  count: number;
  percentage: number;
}

export interface SourceBreakdown {
  sourceName: string;
  count: number;
  percentage: number;
}

export interface SourceConversion {
  sourceName: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}

export interface OverdueFollowUp {
  leadNo: string;
  clientName: string;
  assignedTo: string;
  lastFollowUp: string;
  nextDue: string;
  daysOverdue: number;
  followUpStatus: string;
}

export interface LeadPipelineReportData {
  kpi: LeadKPI;
  funnel: FunnelStage[];
  sourceBreakdown: SourceBreakdown[];
  sourceConversion: SourceConversion[];
  overdueFollowUps: OverdueFollowUp[];
  appliedFilters: {
    dateFrom: string | null;
    dateTo: string | null;
    leadSourceId: string | null;
    leadStatusId: string | null;
    assignedTo: string | null;
    tenantId: string;
  };
}

export interface LeadLifecycleQuotation {
  quotationID: string;
  quotationNo: string;
  quotationDate: string;
  grandTotal: number;
  statusName: string;
}

export interface LeadLifecycleOrder {
  orderID: string;
  orderNo: string;
  orderDate: string;
  grandTotal: number;
  statusName: string;
}

export interface LeadLifecycleFollowup {
  followUpID: string;
  notes: string;
  nextFollowupDate: string | null;
  statusName: string;
  followUpByName: string;
  createdDate: string;
}

export interface LeadLifecycleReportItem {
  leadID: string;
  leadNo: string;
  date: string;
  requirementDetails: string | null;
  clientName: string;
  statusName: string;
  sourceName: string;
  assignedToName: string;
  quotations: LeadLifecycleQuotation[];
  orders: LeadLifecycleOrder[];
  followups: LeadLifecycleFollowup[];
}

export interface LeadPipelineFilter {
  dateFrom?: string;
  dateTo?: string;
  leadSourceId?: string;
  leadStatusId?: string;
  assignedTo?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ClientReportFilter {
  dateFrom?: string;
  dateTo?: string;
  clientId?: string;
  clientType?: number;
  stateId?: number;
}

export interface ClientRevenueKPI {
  totalClients: number;
  activeClients: number;
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  totalOverdue: number;
  averageOrderValue: number;
  totalOrders: number;
}

export interface TopClientItem {
  clientId: string;
  companyName: string;
  contactPerson: string;
  stateName: string;
  totalOrders: number;
  totalInvoiced: number;
  totalCollected: number;
  outstanding: number;
  revenueShare: number;
}

export interface Client360Item {
  clientId: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  gstNo: string;
  stateName: string;
  cityName: string;
  totalLeads: number;
  convertedLeads: number;
  totalQuotations: number;
  acceptedQuotations: number;
  totalOrders: number;
  totalProjects: number;
  totalInvoiced: number;
  totalCollected: number;
  outstanding: number;
  totalExpectedValue: number;
  preferredPaymentMode: string;
  avgDaysToPayment: number;
  lastOrderDate: string | null;
  lastPaymentDate: string | null;
  lastLeadDate: string | null;
}

export interface AgingItem {
  companyName: string;
  invoiceNo: string;
  outstanding: number;
  dueDate: string;
  daysOverdue: number;
  invoiceStatus: string;
}

export interface StateBreakdownItem {
  stateName: string;
  clientCount: number;
  totalInvoiced: number;
  percentage: number;
}

export interface ClientRevenueReportData {
  kpi: ClientRevenueKPI;
  topClients: TopClientItem[];
  client360: Client360Item[];
  agingList: AgingItem[];
  stateBreakdown: StateBreakdownItem[];
  appliedFilters: any;
}

export interface ReportResponse<T> {
  statusCode: number;
  statusMessage: string;
  data: T;
}
