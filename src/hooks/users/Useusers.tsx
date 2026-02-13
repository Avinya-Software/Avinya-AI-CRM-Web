// src/hooks/user/useUsers.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getCompaniesApi, getUsersApi } from "../../api/user.api";
import type { CompanyDropdownOption, UserFilters, UserListData } from "../../interfaces/user.interface";

export const useUsers = (filters: UserFilters) => {
  return useQuery<UserListData>({
    queryKey: ["users", filters],
    queryFn: async () => {
      const response = await getUsersApi(filters);
      return response.data; // Extract the nested data object
    },
    placeholderData: keepPreviousData,
  });
};

export const useCompanies = () => {
  return useQuery<CompanyDropdownOption[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const response = await getCompaniesApi();
      return response; // Extract the nested data object
    },
    placeholderData: keepPreviousData,
  });
};