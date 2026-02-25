import { useQuery } from "@tanstack/react-query";

import { ClientDropdown } from "../../interfaces/client.interface";
import { getClientsDropdownApi } from "../../api/client.api";

export const useClientsDropdown = () => {
  return useQuery<ClientDropdown[]>({
    queryKey: ["clients-dropdown"],
    queryFn: async () => {
      const response = await getClientsDropdownApi();
      return response;
    },
  });
};
