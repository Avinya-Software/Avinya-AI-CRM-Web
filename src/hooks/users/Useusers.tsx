// src/hooks/user/useUsers.ts
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getUsersApi } from "../../api/user.api";
import type { UserFilters, UserListData } from "../../interfaces/user.interface";

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