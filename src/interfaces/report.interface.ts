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
  pageNumber?: number;
  pageSize?: number;
}

export interface ClientRevenueKPI {
  totalClients: number;
  activeClients: number;
  totalInvoiced: number;
  totalCollected: number;
  totalRemainingPayment: number;
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
  remainingPayment: number;
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
  remainingPayment: number;
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
  remainingPayment: number;
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

export interface QuotationKPI {
  totalQuotations: number;
  sentQuotations: number;
  acceptedQuotations: number;
  rejectedQuotations: number;
  expiredQuotations: number;
  pendingQuotations: number;
  acceptanceRate: number;
  rejectionRate: number;
  totalQuotedValue: number;
  acceptedValue: number;
  rejectedValue: number;
  avgQuotationValue: number;
}

export interface QuotationStatusBreakdown {
  statusName: string;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface QuotationProductBreakdown {
  productName: string;
  category: string;
  timesQuoted: number;
  totalQuotedValue: number;
  timesConverted: number;
  conversionRate: number;
}

export interface QuotationClientSummary {
  clientId: string;
  companyName: string;
  totalQuotations: number;
  acceptedQuotations: number;
  rejectedQuotations: number;
  totalQuotedValue: number;
  acceptedValue: number;
  acceptanceRate: number;
}

export interface QuotationExpiryListItem {
  quotationNo: string;
  companyName: string;
  grandTotal: number;
  validTill: string;
  daysOverdue: number;
  statusName: string;
  createdBy: string;
}

export interface QuotationMonthlyTrend {
  year: number;
  month: number;
  monthName: string;
  totalSent: number;
  accepted: number;
  rejected: number;
  totalValue: number;
  acceptedValue: number;
}

export interface QuotationReportData {
  kpi: QuotationKPI;
  statusBreakdown: QuotationStatusBreakdown[];
  productBreakdown: QuotationProductBreakdown[];
  clientSummary: QuotationClientSummary[];
  expiryList: QuotationExpiryListItem[];
  rejectionList: any[];
  monthlyTrend: QuotationMonthlyTrend[];
  appliedFilters: any;
}

export interface QuotationReportFilter {
  dateFrom?: string;
  dateTo?: string;
  quotationStatusId?: string;
  clientId?: string;
  createdBy?: string;
  firmId?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface QuotationLifecycleItemProduct {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuotationLifecycleItemOrder {
  orderID: string;
  orderNo: string;
  orderDate: string;
  grandTotal: number;
  statusName: string;
  invoices: any[]; // Adjust if invoice structure is known
}

export interface QuotationLifecycleReportItem {
  quotationID: string;
  quotationNo: string;
  quotationDate: string;
  clientName: string;
  statusName: string;
  grandTotal: number;
  createdBy: string;
  items: QuotationLifecycleItemProduct[];
  orders: QuotationLifecycleItemOrder[];
}

export interface QuotationLifecycleReportData {
  data: QuotationLifecycleReportItem[];
  totalPages: number;
  totalRecords: number;
}

// Or if it's just an array, we can use QuotationLifecycleReportItem[] directly
export interface ReportResponse<T> {
  statusCode: number;
  statusMessage: string;
  data: T;
}
