// src/interfaces/payment.interface.ts

export interface Payment {
  paymentID: string;
  invoiceID: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNo?: string;
  notes?: string;
  tenantId?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface CreatePaymentDto {
  invoiceID: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNo?: string;
  notes?: string;
}

export interface UpdatePaymentDto extends CreatePaymentDto {
  paymentID: string;
}
