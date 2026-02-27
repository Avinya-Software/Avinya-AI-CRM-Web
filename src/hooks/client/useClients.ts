import { useQuery } from "@tanstack/react-query";

import { ClientDropdown } from "../../interfaces/client.interface";
import { getClientsApi, getClientsDropdownApi } from "../../api/client.api";

export const useClientsDropdown = () => {
  return useQuery<ClientDropdown[]>({
    queryKey: ["clients-dropdown"],
    queryFn: async () => {
      const response = await getClientsDropdownApi();
      return response;
    },
  });
};

export const useClients = (
  page: number,
  pageSize: number,
  search?: string,
  status?: boolean
) => {
  return useQuery({
    queryKey: ["clients", page, pageSize, search, status],
    queryFn: () => getClientsApi(page, pageSize, search, status),
    placeholderData: (prev) => prev,
    select: (res) => res.data, // unwrap to ClientPaginatedData: { data: Client[], totalRecords, totalPages, ... }
  });
};
