export interface ClientDropdown{
    clientID: string;
    contactPerson: string;
    email: string;
    companyName: string;
}
export interface Client {
  clientID: string;
  companyName: string;
  contactPerson: string;
  mobile: string | null;
  email: string | null;
  gstNo: string | null;
  billingAddress: string;
  stateID: number | null;
  stateName: string | null;
  cityID: number | null;
  cityName: string | null;
  clientType: number;
  clientTypeName: string;
  status: boolean;
  notes: string;
  createdBy: string;
  createdByName: string | null;
  createdDate: string;
  updatedAt: string | null;
}

// Response: { statusCode, statusMessage, data: { pageNumber, pageSize, totalRecords, totalPages, data: Client[] } }
export interface ClientPaginatedData {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: Client[];
}

export interface ClientFilterResponse {
  statusCode: number;
  statusMessage: string;
  data: ClientPaginatedData;
}