// src/api/expense.api.ts
import { ApiResponse } from "../interfaces/common.interface";
import { Expense, ExpenseUpsertPayload } from "../interfaces/expense.interface";
import api from "./axios";

/* CREATE EXPENSE */
export const createExpenseApi = async (payload: ExpenseUpsertPayload) => {
  const res = await api.post("/Expense", payload);
  return res.data;
};

/* UPDATE EXPENSE */
export const updateExpenseApi = async (id: string, payload: ExpenseUpsertPayload) => {
  const res = await api.patch(`/Expense/${id}`, payload);
  return res.data;
};

/* GET EXPENSES (WITH FILTER + PAGINATION) */
/* GET EXPENSES (WITH FILTER + PAGINATION) */
export const getExpensesApi = async (params: {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
  from?: string;
  to?: string;
}) => {
  const res = await api.get("/Expense/list", { params });
  return res.data;
};

/* GET SINGLE EXPENSE */
export const getExpenseByIdApi = async (id: string): Promise<Expense> => {
  const res = await api.get<ApiResponse<Expense>>(`/Expense/${id}`);
  return res.data.data;
};

/* DELETE EXPENSE */
export const deleteExpenseApi = async (id: string) => {
  const res = await api.delete(`/Expense/${id}`);
  return res.data;
};

/* EXPENSE TYPE DROPDOWN */
export const getExpenseTypeDropdownApi = async (): Promise<{ id: string; name: string }[]> => {
  const res = await api.get<ApiResponse<{ id: string; name: string }[]>>(
    "/Expense/get-ExpenseType-dropdown"
  );
  return res.data.data;
};