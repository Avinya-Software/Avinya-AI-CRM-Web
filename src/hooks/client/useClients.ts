import { useMutation } from "@tanstack/react-query";
import { ClientDropdown } from "../../interfaces/client.interface";
import { getClientsApi, getClientsDropdownApi } from "../../api/client.api";

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
