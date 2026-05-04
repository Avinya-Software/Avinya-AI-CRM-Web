// src/api/invoice.api.ts

import api from "./axios";
import { 
  Invoice, 
  InvoiceFilters, 
  CreateInvoiceDto, 
  UpdateInvoiceDto 
} from "../interfaces/invoice.interface";
import { PaginatedResponse } from "../interfaces/quotation.interface";
import { ApiWrapper } from "../interfaces/admin.interface";

// ── GET: Fetch invoices with filters (Updated to use /filter) ────────
export const getInvoices = async (
  filters: InvoiceFilters
): Promise<PaginatedResponse<Invoice>> => {
  const params = new URLSearchParams();
  if (filters.search)    params.append("search", filters.search);
  if (filters.status)    params.append("status", filters.status);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate)   params.append("endDate", filters.endDate);
  params.append("page",     filters.page.toString());
  params.append("pageSize", filters.pageSize.toString());

  const response = await api.get(`/Invoice/filter?${params.toString()}`);
  return response.data.data; // The controller uses JsonResult(response)
};

// ── GET: Fetch single invoice by ID ──────────────────────────────────
export const getInvoiceById = async (
  id: string
): Promise<Invoice> => {
  const response = await api.get(`/Invoice/${id}`);
  return response.data;
};

// ── POST: Create new invoice ─────────────────────────────────────────
export const createInvoice = async (data: CreateInvoiceDto) => {
  const response = await api.post("/Invoice", data);
  return response.data;
};

// ── PUT: Update existing invoice ────────────────────────────────────
export const updateInvoice = async (data: UpdateInvoiceDto) => {
  const response = await api.put("/Invoice", data);
  return response.data;
};

// ── DELETE: Delete invoice ───────────────────────────────────────────
export const deleteInvoice = async (id: string) => {
  const response = await api.delete(`/Invoice/${id}`);
  return response.data;
};

// ── GET: Invoice Status Dropdown ─────────────────────────────────────
export const getInvoiceStatusDropdown = async (): Promise<any[]> => {
  const response = await api.get("/Invoice/status-dropdown");
  return response.data.data;
};

// ── GET: Download Invoice PDF (Assuming similar to Order) ─────────────
export const downloadInvoicePdf = async (id: string): Promise<Blob> => {
  const response = await api.get(`/Invoice/download-pdf/${id}`, {
    responseType: "blob",
  });
  return response.data;
};

// ── GET: Fetch Invoice with items by ID ─────────────────────────────
export const getInvoiceWithItems = async (
  id: string
): Promise<Invoice> => {
  const response = await api.get(`/Invoice/getinvoicewithitems/${id}`);
  return response.data;
};

// ── POST: Send Invoice Email ─────────────────────────────────────────
export const sendInvoiceEmail = async (id: string) => {
  const response = await api.post(`/Invoice/send-email/${id}`);
  return response.data;
};
