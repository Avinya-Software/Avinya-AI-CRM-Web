import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginAdminApi, getUserPermissions, getUserMenu } from "../../api/admin.api";
import type { AdminLoginRequest } from "../../interfaces/admin.interface";


export const useLoginAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminLoginRequest) =>
      loginAdminApi(data),

    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["user-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
    }
  });
};

export const useGetUserPermissions = () => {
  return useMutation({
    mutationFn: (userId: string) => getUserPermissions(userId),
  });
};

export const useGetUserMenu = () => {
  return useMutation({
    mutationFn: (userId: string) => getUserMenu(userId),
  });
};
