// src/api/lead.api.ts
import api from "./axios";
import type {
  LeadFilters,
  LeadListResponse,
} from "../interfaces/lead.interface";
import { ApiResponse } from "../interfaces/common.interface";

/*   GET LEADS (PAGINATED)   */

export const getLeadsApi = async (
  filters: LeadFilters
): Promise<LeadListResponse> => {

  const res = await api.get<ApiResponse<LeadListResponse>>(
    "/Lead/filter",
    { params: filters }
  );

  return res.data.data; // ⭐ unwrap here
};

/*   LEAD STATUSES   */

export const getLeadStatusesApi = async (): Promise<any[]> => {
  const res = await api.get<ApiResponse<any[]>>(
    "/lead/status-dropdown"
  );

  return res.data.data; // ⭐ unwrap
};

/*   LEAD SOURCES   */

export const getLeadSourcesApi = async (): Promise<any[]> => {
  const res = await api.get<ApiResponse<any[]>>(
    "/lead/source-dropdown"
  );

  return res.data.data;
};

/*   CREATE / UPDATE LEAD   */

export const upsertLeadApi = async (data: any) => {
  const res = await api.post("/Lead", data);
  return res.data;
};

/*   DELETE LEAD (BY ID)   */

export const deleteLeadApi = async (
  leadId: string
) => {
  const res = await api.delete(
    `/Lead/${leadId}`
  );
  return res.data;
};
export const updateLeadStatusApi = async (
  leadId: string,
  statusId: number,
  notes?: string
) => {
  const res = await api.patch(
    `/Lead/${leadId}/status/${statusId}`,
    null,
    {
      params: notes ? { notes } : undefined,
    }
  );

  return res.data;
};