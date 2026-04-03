// src/interfaces/expense.interface.ts

export interface Expense {
  expenseId: string;
  expenseDate: string;           
  categoryId: number;           
  amount: number;
  paymentMode: string;
  description?: string | null;
  receiptPath?: string | null;   
  status: string;
  remarks?: string | null;       
  createdBy?: string | null;
  createdDate?: string | null;
  updatedDate?: string | null;
  expenseCategory?: {
    categoryId: number;
    categoryName: string;
  };
}

export interface ExpenseUpsertPayload {
  expenseID?: string | null;
  expenseDate: string;
  expenseType: string;
  amount: number;
  description?: string | null;
  receiptUrl?: string | null;
  receiptFile?: File | null;
  status?: string;
  remarks?: string | null;
  createdBy?: string | null;
}