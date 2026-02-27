// src/api/order.api.ts

import api from "./axios";

import { ApiWrapper } from "../interfaces/admin.interface";
import { CreateOrderDto, Order, OrderDropdownItem, OrderFilters, UpdateOrderDto } from "../interfaces/order.interface";
import { PaginatedResponse } from "../interfaces/quotation.interface";

// ── GET: Fetch orders with filters ─────────────────────────────────
export const getOrders = async (
  filters: OrderFilters
): Promise<PaginatedResponse<Order>> => {
  const params = new URLSearchParams();
  if (filters.search)    params.append("search", filters.search);
  if (filters.status)    params.append("status", filters.status);
  if (filters.startDate) params.append("startDate", filters.startDate);
  if (filters.endDate)   params.append("endDate", filters.endDate);
  params.append("page",     filters.page.toString());
  params.append("pageSize", filters.pageSize.toString());

  const response = await api.get(`/Order/list?${params.toString()}`);
  return response.data.data;
};

// ── GET: Fetch single order by ID ──────────────────────────────────
export const getOrderById = async (
  id: string
): Promise<ApiWrapper<Order>> => {
  const response = await api.get(`/Order/${id}`);
  return response.data;
};

// ── GET: Fetch order dropdown list ─────────────────────────────────
export const getOrderDropdown = async (): Promise<
  ApiWrapper<OrderDropdownItem[]>
> => {
  const response = await api.get("/Order/get-order-dropdown-list");
  return response.data;
};

// ── POST: Create new order ─────────────────────────────────────────
export const createOrder = async (data: CreateOrderDto) => {
  const response = await api.post("/Order/save", data);
  return response.data;
};

// ── POST: Update existing order ────────────────────────────────────
export const updateOrder = async (id: string, data: UpdateOrderDto) => {
  const payload = { orderID: id, ...data };
  const response = await api.post("/Order/save", payload);
  return response.data;
};

// ── DELETE: Delete order ───────────────────────────────────────────
export const deleteOrder = async (id: string) => {
  const response = await api.delete(`/Order/${id}`);
  return response.data;
};