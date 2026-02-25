import { ClientDropdown } from "../interfaces/client.interface";
import { ApiResponse } from "../interfaces/common.interface";
import api from "./axios";

export const getClientsDropdownApi = async (): Promise<ClientDropdown[]> => {
  const res = await api.get<ApiResponse<ClientDropdown[]>>(
    "/Client/get-user-dropdown-list"
  );

  return res.data.data; // ⭐ ONLY ARRAY
};