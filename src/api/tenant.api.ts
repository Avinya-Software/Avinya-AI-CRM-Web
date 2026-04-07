import { ApiResponse } from "../interfaces/common.interface";
import { Tenant } from "../interfaces/tenant.interface";
import api from "./axios";

export const getTenant = async (tenantId: string): Promise<Tenant> => {
  const res = await api.get<ApiResponse<Tenant>>(
    `/Tenant/get?TenantId=${tenantId}`
  );
  return res.data.data;
};

export const updateTenant = async (tenant: Tenant): Promise<ApiResponse<Tenant>> => {
  const res = await api.post<ApiResponse<Tenant>>("/Tenant/Update", tenant);
  return res.data;
};
