// src/hooks/user/useUsers.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCompaniesApi, getUserRolesApi, getUsersApi, getUsersDropdownApi, resendInvitationApi } from "../../api/user.api";
import type { CompanyDropdownOption, UserDropdownOption, UserFilters, UserListData } from "../../interfaces/user.interface";

export const useUsers = () => {
  return useMutation<UserListData, Error, UserFilters>({
    mutationFn: async (filters: UserFilters) => {
      const response = await getUsersApi(filters);
      return response.data;
    },
  });
};

export const useUsersQuery = (filters: UserFilters) => {
  return useQuery<UserListData, Error>({
    queryKey: ["users", filters],
    queryFn: async () => {
      const response = await getUsersApi(filters);
      return response.data;
    },
  });
};

export const useCompanies = () => {
  return useMutation<CompanyDropdownOption[], Error, void>({
    mutationFn: async () => {
      const response = await getCompaniesApi();
      return response;
    },
  });
};

export const useCompaniesQuery = (enabled: boolean = true) => {
  return useQuery<CompanyDropdownOption[], Error>({
    queryKey: ["companies-dropdown"],
    queryFn: async () => {
      const response = await getCompaniesApi();
      return response;
    },
    enabled,
  });
};

export const useUsersDropdown = () => {
  return useMutation<UserDropdownOption[], Error, void>({
    mutationFn: async () => {
      const response = await getUsersDropdownApi();
      return response;
    },
  });
};

export const useUsersDropdownQuery = (enabled: boolean = true) => {
  return useQuery<UserDropdownOption[], Error>({
    queryKey: ["users-dropdown"],
    queryFn: async () => {
      const response = await getUsersDropdownApi();
      return response;
    },
    enabled,
  });
};

export const useRoles = () => {
  return useMutation<{ id: string; name: string }[], Error, void>({
    mutationFn: async () => {
      const response = await getUserRolesApi();
      return response;
    },
  });
};

export const useRolesQuery = (enabled: boolean = true) => {
  return useQuery<{ id: string; name: string }[], Error>({
    queryKey: ["roles-dropdown"],
    queryFn: async () => {
      const response = await getUserRolesApi();
      return response;
    },
    enabled,
  });
};

export const useResendInvitation = () => {
  return useMutation<any, Error, string>({
    mutationFn: async (userId: string) => {
      const response = await resendInvitationApi(userId);
      return response;
    },
  });
};
