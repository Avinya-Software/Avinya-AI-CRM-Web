// src/interfaces/expense.interface.ts

export interface Expense {
  expenseId: string;
  expenseDate: string;           // ISO date string
  expenseType: string;           // e.g. "Travel", "Food", "Utilities", "Other"
  amount: number;
  description?: string | null;
  receiptUrl?: string | null;    // URL or file path of uploaded receipt
  status: "pending" | "approved" | "rejected" | "paid";
  remarks?: string | null;       // Admin remarks on approval/rejection
  createdBy?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
}

export interface ExpenseUpsertPayload {
  expenseID?: string | null;
  expenseDate: string;
  expenseType: string;
  amount: number;
  description?: string | null;
  receiptUrl?: string | null;
  status?: string;
  remarks?: string | null;
  createdBy?: string | null;
}