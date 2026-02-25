// src/interfaces/quotation.interface.ts

export type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Rejected";

export interface QuotationItem {
  quotationItemID?: string;
  quotationID?: string;
  productID: string;
  productName?: string;
  unitName?: string;
  hsnCode?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxCategoryID?: string;
  taxCategoryName?: string;
  lineTotal?: number;
  rate?: number;
}

export interface Quotation {
  quotationID: string;
  quotationNo?: string;
  clientID?: string;
  leadID?: string | null;
  leadNo?: string | null;
  companyName?: string;
  email?: string | null;
  mobile?: string | null;
  billAddress?: string;
  shippingAddress?: string | null;
  gstNo?: string | null;
  clientName?: string;
  firmName?: string | null;
  firmGSTNo?: string | null;
  firmAddress?: string | null;
  firmMobile?: string | null;
  quotationDate: string;
  validTill: string;
  status: string;           // UUID from backend
  statusName?: QuotationStatus;
  firmID: number;
  enableTax: boolean;
  rejectedNotes?: string;
  termsAndConditions?: string;
  createdBy?: string;
  createdByName?: string;
  totalAmount?: number;     // subtotal from API
  taxes?: number;
  subTotal?: number;        // alias — map from totalAmount if needed
  totalTax?: number;        // alias — map from taxes if needed
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
  leadID?: string | null;
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

export interface TaxCategory {
  taxCategoryID: string;
  taxName: string;
  rate: number;
  isCompound: boolean;
}

export interface Product {
  productId: string;
  insurerId: string;
  insurerName?: string;
  productCategoryId: number;
  productCategory?: string;
  productName: string;
  productCode: string;
  defaultReminderDays: number;
  commissionRules: string;
  isActive: boolean;
}

export interface ProductDropdown {
  productID: string;
  productName: string;
  description?: string;
  unitName: string;
  defaultRate?: number;
}

export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: T[];
}