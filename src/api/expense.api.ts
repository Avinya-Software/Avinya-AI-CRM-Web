// src/api/expense.api.ts
import { ApiResponse } from "../interfaces/common.interface";
import { Expense, ExpenseUpsertPayload } from "../interfaces/expense.interface";
import api from "./axios";

/* CREATE EXPENSE */
export const createExpenseApi = async (payload: ExpenseUpsertPayload) => {
  const formData = new FormData();

  formData.append("ExpenseDate", payload.expenseDate);
  // C# DTO Expects CategoryId and PaymentMode instead of ExpenseType
  formData.append("CategoryId", "1");
  formData.append("PaymentMode", "UPI");
  formData.append("Amount", String(payload.amount));
  formData.append("Description", payload.description || "");
  formData.append("Status", payload.status || "Unpaid");

  if (payload.receiptFile instanceof File) {
    formData.append("ReceiptFile", payload.receiptFile, payload.receiptFile.name);
  }

  const res = await api.post("/Expense", formData);
  return res.data;
};

/* UPDATE EXPENSE */
export const updateExpenseApi = async (id: string, payload: ExpenseUpsertPayload) => {
  const formData = new FormData();

  const expenseId = payload.expenseID || id;
  formData.append("ExpenseId", expenseId);
  formData.append("ExpenseDate", payload.expenseDate);

  // C# DTO Expects CategoryId and PaymentMode instead of ExpenseType
  formData.append("CategoryId", "1");
  formData.append("PaymentMode", "Online");

  formData.append("Amount", String(payload.amount));
  formData.append("Description", payload.description || "");
  formData.append("Status", payload.status || "Unpaid");

  if (payload.receiptFile instanceof File) {
    formData.append("ReceiptFile", payload.receiptFile, payload.receiptFile.name);
  }

  const res = await api.put("/Expense", formData);
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