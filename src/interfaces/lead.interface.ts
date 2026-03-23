
export interface CreateLeadRequest {
  leadId?: string;
  fullName: string;
  email?: string;
  mobile?: string;
  address?: string;
  leadStatusId: number;
  leadSourceId: number;
  leadSourceDescription?: string;
  advisorId: string;
  notes?: string;
  customerId?: string;
}

export interface LeadResponse {
  leadId: string;
  leadNo: string;
  fullName: string;
  email?: string;
  mobile?: string;
  createdAt: string;
}
// src/interfaces/lead.interface.ts

export interface Lead {
  leadID: string;
  leadNo: string;
  contactPerson: string;
  email: string;
  mobile: string;
  customerId: string | null;
  statusName: string;
  leadSourceName: string;
  createdDate: string;

}

export interface LeadFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface LeadListResponse {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: Lead[];
}


export interface LeadDetail {
  leadID: string;
  leadNo: string;
  clientID: string;
  contactPerson: string;
  mobile: string;
  email: string;
  stateID: number;
  cityID: number;
  date: string;
  requirementDetails: string;
  leadSourceID: string | null;
  leadSourceName: string | null;
  otherSources: string | null;
  status: string;
  statusName: string;
  notes: string;
  links: string;
  createdBy: string;
  createdbyName: string;
  assignedTo: string | null;
  assignToName: string | null;
  createdDate: string;
  clientType: number;
  clientTypeName: string;
  companyName: string;
  gstNo: string;
  billingAddress: string;
  followupCount: number;
  latestLeadFollowupId: string | null;
  latestFollowupStatus: string | null;
  nextFollowupDate: string | null;
  followups: LeadFollowUp[];
}

export interface LeadFollowUp {
  followUpID: string;
  leadID: string;
  notes: string;
  nextFollowupDate: string | null;
  status: number;
  statusName: string;
  followUpBy: string | null;
  followUpByName: string | null;
  createdDate: string;
  updatedDate: string | null;
}