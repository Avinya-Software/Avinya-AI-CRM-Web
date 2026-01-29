export interface InsurerFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
}

export interface Insurer {
  insurerId: string;
  insurerName: string;
  shortCode: string;
  contactDetails: string;
  portalUrl: string;
  portalUsername: string;
  createdAt?: string;
}

export interface InsurerListResponse {
  totalRecords: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  data: Insurer[];
}