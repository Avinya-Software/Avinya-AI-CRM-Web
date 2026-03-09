import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginAdminApi, getUserPermissions, getUserMenu } from "../../api/admin.api";
import type { AdminLoginRequest } from "../../interfaces/admin.interface";
import { getToken, getUserId, saveToken, saveUserId } from "../../utils/token";



export const useLoginAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminLoginRequest) =>
      loginAdminApi(data),

    onSuccess: (res) => {
       const data = res.data;
  saveToken(data.token);   // ✅ "avinyaAiCRM_token" mein save hoga
  saveUserId(data.userId); // ✅ "avinyaAiCRM_userId" mein save hoga
  queryClient.removeQueries({ queryKey: ["user-permissions"] });
  queryClient.invalidateQueries({ queryKey: ["user-permissions"] });
    }
  });
};

export const useGetUserPermissions = () => {
  const token = getToken();
  const userId = getUserId();
  
  return useQuery({
    queryKey: ["user-permissions", userId, !!token],
    queryFn: () => getUserPermissions(userId!),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: !!token && !!userId,
  });
};

export const useGetUserMenu = () => {
    const userId = getUserId();
  return useQuery({
    queryKey: ["user-menu", userId],
    queryFn: () => getUserMenu(userId!),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

