import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { PermissionModule } from "../../interfaces/user.interface";

export const usePermissions = () => {
  return useMutation<PermissionModule[], Error, void>({
    mutationFn: async () => {
      const res = await api.get("/permission/list");
      return res.data.data;
    },
  });
};

export const usePermissionsQuery = (enabled: boolean = true) => {
  return useQuery<PermissionModule[], Error>({
    queryKey: ["permission-modules"],
    queryFn: async () => {
      const res = await api.get("/permission/list");
      return res.data.data;
    },
    enabled,
  });
};
