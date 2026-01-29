// src/api/user.api.ts
import api from "./axios";
import type {
  UserFilters,
  UserListResponse,
  UserUpsertRequest,
} from "../interfaces/user.interface";

/*   GET USERS (PAGINATED)   */

export const getUsersApi = async (filters: UserFilters) => {
  const res = await api.get<UserListResponse>("/User", {
    params: filters,
  });
  return res.data;
};

/*   GET USER ROLES   */

export const getUserRolesApi = async () => {
  const res = await api.get<{ id: string; name: string }[]>("/User/roles");
  return res.data;
};

/*   GET TENANTS   */

export const getTenantsApi = async () => {
  const res = await api.get<{ id: string; name: string }[]>("/User/tenants");
  return res.data;
};

/*   CREATE / UPDATE USER   */

export const upsertUserApi = async (data: UserUpsertRequest) => {
  const res = await api.post("/User", data);
  return res.data;
};

/*   DELETE USER (BY ID)   */

export const deleteUserApi = async (userId: string) => {
  const res = await api.delete(`/User/${userId}`);
  return res.data;
};

/*   UPDATE USER STATUS   */

export const updateUserStatusApi = async (
  userId: string,
  isActive: boolean
) => {
  const res = await api.patch(`/User/${userId}/status`, { isActive });
  return res.data;
};