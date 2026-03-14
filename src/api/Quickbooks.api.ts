import api from "./axios";
import type { ApiWrapper } from "../interfaces/admin.interface";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QBCustomer {
  Id: string;
  DisplayName: string;
  CompanyName?: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
}

export interface QBInvoice {
  Id: string;
  DocNumber: string;
  CustomerRef: { value: string; name: string };
  TotalAmt: number;
  Balance: number;
}

export interface CreateCustomerRequest {
  DisplayName: string;
  CompanyName?: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
}

export interface CreateInvoiceRequest {
  CustomerRef: { value: string };
  Line: {
    Amount: number;
    DetailType: "SalesItemLineDetail";
    SalesItemLineDetail: {
      ItemRef: { value: string };
      Qty: number;
      UnitPrice: number;
    };
  }[];
}

// ─── Connect ──────────────────────────────────────────────────────────────────

// CONNECT QUICKBOOKS (OAuth redirect)
export const connectQuickBooksApi = () => {
  window.location.href = `${api.defaults.baseURL}/quickbooks/connect`;
};

// ─── Customers ────────────────────────────────────────────────────────────────

// GET ALL CUSTOMERS
export const getQuickBooksCustomersApi = async () => {
  const res = await api.get<ApiWrapper<any>>("/quickbooks/customers");
  return res.data;
};

// CREATE CUSTOMER
export const createQuickBooksCustomerApi = async (
  data: CreateCustomerRequest
) => {
  const res = await api.post<ApiWrapper<QBCustomer>>(
    "/quickbooks/customer",
    data
  );
  return res.data;
};

// ─── Invoices ─────────────────────────────────────────────────────────────────

// GET ALL INVOICES
export const getQuickBooksInvoicesApi = async () => {
  const res = await api.get<ApiWrapper<any>>("/quickbooks/invoices");
  return res.data;
};

// CREATE INVOICE
export const createQuickBooksInvoiceApi = async (
  data: CreateInvoiceRequest
) => {
  const res = await api.post<ApiWrapper<QBInvoice>>(
    "/quickbooks/invoice",
    data
  );
  return res.data;
};