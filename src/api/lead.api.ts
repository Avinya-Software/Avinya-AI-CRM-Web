// src/api/lead.api.ts
import api from "./axios";
import type {
  LeadFilters,
  LeadListResponse,
} from "../interfaces/lead.interface";

/*   GET LEADS (PAGINATED)   */

export const getLeadsApi = async (filters: LeadFilters) => {
  const res = await api.get<LeadListResponse>("/Lead", {
    params: filters,
  });
  return res.data;
};

/*   LEAD STATUSES   */

export const getLeadStatusesApi = async () => {
  const res = await api.get<{ id: number; name: string }[]>(
    "/Lead/lead-statuses"
  );
  return res.data;
};

/*   LEAD SOURCES   */

export const getLeadSourcesApi = async () => {
  const res = await api.get<{ id: number; name: string }[]>(
    "/Lead/lead-sources"
  );
  return res.data;
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