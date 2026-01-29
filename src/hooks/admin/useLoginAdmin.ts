import { useMutation, useQuery } from "@tanstack/react-query";
import { loginAdminApi, getUserPermissions, getUserMenu } from "../../api/admin.api";
import type { AdminLoginRequest } from "../../interfaces/admin.interface";
import { saveToken } from "../../utils/token";

export const useLoginAdmin = () => {
  return useMutation({
    mutationFn: (data: AdminLoginRequest) =>
      loginAdminApi(data),

    onSuccess: (res) => {
      //  Save JWT
      saveToken(res.data.token);

      // Optional: store admin info
      localStorage.setItem("admin", JSON.stringify(res.data));
    }
  });
};

export const useGetUserPermissions = () => {
  return useQuery({
    queryKey: ["user-permissions"],
    queryFn: getUserPermissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useGetUserMenu = () => {
  return useQuery({
    queryKey: ["user-menu"],
    queryFn: getUserMenu,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

