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
  leadId: string;
  leadNo: string;
  fullName: string;
  email: string;
  mobile: string;
  customerId: string | null;
  leadStatus: string;
  leadSource: string;
  createdAt: string;
}

export interface LeadFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  leadStatusId?: number;
  leadSourceId?: number;
}

export interface LeadListResponse {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: Lead[];
}
