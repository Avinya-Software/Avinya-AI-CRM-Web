// src/interfaces/quotation.interface.ts

export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Rejected";

export interface QuotationItem {
  quotationItemID?: string;
  productID: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxCategoryID?: string;
}

export interface Quotation {
  quotationID: string;
  quotationNo?: string;
  clientID?: string;
  leadID?: string;
  companyName?: string;
  firmName?: string;
  quotationDate: string;
  validTill: string;
  status: string; // Status ID from backend
  statusName?: QuotationStatus; // Human-readable status
  firmID: number;
  enableTax: boolean;
  rejectedNotes?: string;
  termsAndConditions?: string;
  createdBy?: string;
  subTotal?: number;
  totalTax?: number;
  grandTotal?: number;
  items: QuotationItem[];
}

export interface QuotationFilters {
  search?: string;
  status?: string;
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateQuotationDto {
  clientID?: string;
  leadID?: string;
  quotationDate: string;
  validTill: string;
  status: string;
  firmID: number;
  enableTax: boolean;
  rejectedNotes?: string;
  termsAndConditions?: string;
  items: QuotationItem[];
}

export interface UpdateQuotationDto {
  quotationDate?: string;
  validTill?: string;
  status?: string;
  firmID?: number;
  enableTax?: boolean;
  rejectedNotes?: string;
  termsAndConditions?: string;
  items?: QuotationItem[];
}

export interface QuotationDropdownItem {
  id: string;
  quotationNo: string;
  companyName: string;
  grandTotal: number;
}