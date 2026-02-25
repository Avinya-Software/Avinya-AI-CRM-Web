// src/api/quotation.api.ts

import api from "./axios";
import {
  Quotation,
  CreateQuotationDto,
  UpdateQuotationDto,
  QuotationFilters,
  QuotationDropdownItem,
  PaginatedResponse,
} from "../interfaces/quotation.interface";
import { ApiWrapper } from "../interfaces/admin.interface";

// ── GET: Fetch quotations with filters ─────────────────────────────
export const getQuotations = async (
  filters: QuotationFilters
): Promise<PaginatedResponse<Quotation>> => {
  const params = new URLSearchParams();
  if (filters.search)    params.append("search", filters.search);
  if (filters.status)    params.append("status", filters.status);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate)   params.append("endDate", filters.endDate);
  params.append("page",     filters.page.toString());
  params.append("pageSize", filters.pageSize.toString());

  const response = await api.get(`/Quotation/filter?${params.toString()}`);

  // API shape: { statusCode, data: { pageNumber, pageSize, totalRecords, totalPages, data: Quotation[] } }
  //                                 ↑ this whole object is PaginatedResponse
  return response.data.data;  // ← NOT response.data.data.data
};

// ── GET: Fetch single quotation by ID ──────────────────────────────
export const getQuotationById = async (
  id: string
): Promise<ApiWrapper<Quotation>> => {
  const response = await api.get(`/Quotation/${id}`);
  return response.data;
};

// ── GET: Fetch quotation dropdown list ─────────────────────────────
export const getQuotationDropdown = async (): Promise<
  ApiWrapper<QuotationDropdownItem[]>
> => {
  const response = await api.get("/Quotation/get-quotation-dropdown-list");
  return response.data;
};

// ── POST: Create new quotation ─────────────────────────────────────
export const createQuotation = async (data: CreateQuotationDto) => {
  const response = await api.post("/Quotation/addOrUpdate", data);
  return response.data;
};

// ── POST: Update existing quotation ────────────────────────────────
export const updateQuotation = async (
  id: string,
  data: UpdateQuotationDto
) => {
  const payload = {
    quotationID: id,
    ...data,
  };
  const response = await api.post("/Quotation/addOrUpdate", payload);
  return response.data;
};

// ── DELETE: Delete quotation ───────────────────────────────────────
export const deleteQuotation = async (id: string) => {
  const response = await api.delete(`/Quotation/${id}`);
  return response.data;
};