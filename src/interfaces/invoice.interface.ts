// src/interfaces/invoice.interface.ts

export interface InvoiceItem {
  invoiceItemID?: string;
  invoiceID?: string;
  productID: string;
  productName?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxCategoryID?: string | null;
  lineTotal: number;
}

export interface Invoice {
  invoiceID: string;
  invoiceNo: string;
  orderID?: string;
  orderNo?: string;
  clientID: string;
  contactPerson?: string;
  companyName?: string;
  invoiceDate: string;
  dueDate: string;
  subTotal: number;
  taxes: number; // renamed from totalTax to match new user request
  discount: number;
  grandTotal: number;
  invoiceStatusID: number;
  statusName?: string;
  placeOfSupply?: string;
  outstandingAmount?: number;
  reverseCharge: boolean;
  grrrNo?: string;
  transport?: string;
  vehicleNo?: string;
  station?: string;
  eWayBillNo?: string;
  notes?: string;
  termsAndConditions?: string;
  remainingPayment?: number;
  paidAmount?: number;
  items?: InvoiceItem[];
  orderItems?: any[];
}

export interface CreateInvoiceDto {
  orderID?: string | null;
  clientID: string;
  invoiceDate: string;
  dueDate: string;
  subTotal: number;
  taxes: number;
  discount: number;
  grandTotal: number;
  invoiceStatusID: number;
  placeOfSupply?: string;
  reverseCharge: boolean;
  grrrNo?: string;
  transport?: string;
  vehicleNo?: string;
  station?: string;
  eWayBillNo?: string;
  notes?: string;
  termsAndConditions?: string;
}


export interface UpdateInvoiceDto extends CreateInvoiceDto {
  invoiceID: string;
}

export interface InvoiceFilters {
  page: number;
  pageSize: number;
  search: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
