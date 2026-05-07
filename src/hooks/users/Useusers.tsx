// src/hooks/user/useUsers.ts
import { useMutation } from "@tanstack/react-query";
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

export const useCompanies = () => {
  return useMutation<CompanyDropdownOption[], Error, void>({
    mutationFn: async () => {
      const response = await getCompaniesApi();
      return response;
    },
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

export const useRoles = () => {
  return useMutation<{ id: string; name: string }[], Error, void>({
    mutationFn: async () => {
      const response = await getUserRolesApi();
      return response;
    },
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
