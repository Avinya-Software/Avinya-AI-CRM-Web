import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";
import { PermissionModule } from "../../interfaces/user.interface";

export const usePermissions = () => {
  return useQuery<PermissionModule[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const res = await api.get("/permission/list");
      return res.data.data;
    },
  });
};
