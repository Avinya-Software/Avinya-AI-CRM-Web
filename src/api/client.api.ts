import { Client, ClientDropdown, ClientFilterResponse } from "../interfaces/client.interface";
import { ApiResponse } from "../interfaces/common.interface";
import api from "./axios";

export const getClientsDropdownApi = async (): Promise<ClientDropdown[]> => {
  const res = await api.get<ApiResponse<ClientDropdown[]>>(
    "/Client/get-user-dropdown-list"
  );

  return res.data.data; // ⭐ ONLY ARRAY
};


// GET /api/Client/filter
export const getClientsApi = async (
  page: number,
  pageSize: number,
  search?: string,
  status?: boolean
): Promise<ClientFilterResponse> => {
  const params: Record<string, any> = { page, pageSize };
  if (search) params.search = search;
  if (status !== undefined) params.status = status;

  const res = await api.get("/Client/filter", { params });
  return res.data; // { statusCode, statusMessage, data: { pageNumber, pageSize, totalRecords, totalPages, data: Client[] } }
};

// POST /api/Client
export const createClientApi = async (
  payload: Omit<Client, "clientID" | "stateName" | "cityName" | "clientTypeName" | "createdBy" | "createdByName" | "createdDate" | "updatedAt">
): Promise<Client> => {
  const res = await api.post("/Client", payload);
  return res.data;
};

// PUT /api/Client/{id}
export const updateClientApi = async (
  id: string,
  payload: Omit<Client, "stateName" | "cityName" | "clientTypeName" | "createdBy" | "createdByName" | "createdDate" | "updatedAt">
): Promise<Client> => {
  const res = await api.put(`/Client/${id}`, payload);
  return res.data;
};

// DELETE /api/Client/{id}
export const deleteClientApi = async (id: string): Promise<void> => {
  await api.delete(`/Client/${id}`);
};








