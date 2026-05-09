import { useMutation, useQuery } from "@tanstack/react-query";
import { ClientDropdown } from "../../interfaces/client.interface";
import { getClientsApi, getClientsDropdownApi } from "../../api/client.api";

// ── Existing Mutation Hooks (Kept for compatibility) ────────────────
export const useClientsDropdown = () => {
  return useMutation<ClientDropdown[], Error, void>({
    mutationFn: async () => {
      const response = await getClientsDropdownApi();
      return response;
    },
  });
};

export const useClients = () => {
  return useMutation({
    mutationFn: ({
      page,
      pageSize,
      search,
      status,
    }: {
      page: number;
      pageSize: number;
      search?: string;
      status?: boolean;
    }) =>
      getClientsApi(page, pageSize, search, status).then((res) => res.data),
  });
};

// ── New Query Hooks (For sequential loading) ───────────────────────
export const useClientsDropdownQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["clientsDropdown"],
    queryFn: async () => {
      const response = await getClientsDropdownApi();
      return response;
    },
    enabled,
  });
};

export const useClientsQuery = (params: { page: number; pageSize: number; search?: string; status?: boolean }, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => getClientsApi(params.page, params.pageSize, params.search, params.status).then((res) => res.data),
    enabled,
  });
};
