// src/api/payment.api.ts

import api from "./axios";
import { Payment, CreatePaymentDto, UpdatePaymentDto } from "../interfaces/payment.interface";

export const getPaymentById = async (id: string): Promise<Payment> => {
  const response = await api.get(`/Payment/${id}`);
  return response.data.data;
};

export const getPaymentsByInvoiceId = async (InvoiceID: string): Promise<Payment[]> => {
  const response = await api.get(`/Payment/Getpaymentbyinvoice/${InvoiceID}`);
  return response.data.data;
};

export const createPayment = async (data: CreatePaymentDto): Promise<Payment> => {
  const response = await api.post("/Payment", data);
  return response.data.data;
};

export const updatePayment = async (data: UpdatePaymentDto): Promise<Payment> => {
  const response = await api.put("/Payment", data);
  return response.data.data;
};

