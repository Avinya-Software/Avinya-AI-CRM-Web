// src/hooks/user/useUsers.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCompaniesApi, getUsersApi, getUsersDropdownApi } from "../../api/user.api";
import type { CompanyDropdownOption, UserDropdownOption, UserFilters, UserListData } from "../../interfaces/user.interface";

export const useUsers = (filters: UserFilters) => {
  return useQuery<UserListData>({
    queryKey: ["users", filters],
    queryFn: async () => {
      const response = await getUsersApi(filters);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useCompanies = () => {
  return useQuery<CompanyDropdownOption[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await getCompaniesApi();
      return response;
    },
    placeholderData: keepPreviousData,
  });
};

export const useUsersDropdown = () => {
  return useQuery<UserDropdownOption[]>({
    queryKey: ["users-dropdown"],
    queryFn: async () => {
      const response = await getUsersDropdownApi();
      return response;
    },
    placeholderData: keepPreviousData,
  });
};