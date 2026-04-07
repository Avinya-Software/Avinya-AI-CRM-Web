import { ApiResponse } from "../interfaces/common.interface";
import { BankDetails } from "../interfaces/bankDetail.interface";
import api from "./axios";

export const getBankDetails = async (tenantId: string): Promise<BankDetails[]> => {
  const res = await api.get<ApiResponse<BankDetails[]>>(
    `/BankDetail/getbankdatail?TenantId=${tenantId}`
  );
  return res.data.data;
};

export const addBankDetail = async (bankDetails: BankDetails): Promise<ApiResponse<BankDetails>> => {
  const res = await api.post<ApiResponse<BankDetails>>("/BankDetail/add", bankDetails);
  return res.data;
};

export const updateBankDetail = async (bankDetails: BankDetails): Promise<ApiResponse<BankDetails>> => {
  const res = await api.post<ApiResponse<BankDetails>>("/BankDetail/update", bankDetails);
  return res.data;
};

export const deleteBankDetail = async (bankAccountId: string): Promise<ApiResponse<void>> => {
  const res = await api.delete<ApiResponse<void>>(
    `/BankDetail/deleted?bankAccountId=${bankAccountId}`
  );
  return res.data;
};
