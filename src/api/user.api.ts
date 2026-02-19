// src/api/user.api.ts
import api from "./axios";
import type {
  UserFilters,
  UserListResponse,
  UserUpsertRequest,
} from "../interfaces/user.interface";

/*   GET USERS (PAGINATED)   */

export const getUsersApi = async (filters: UserFilters) => {
  const res = await api.get<UserListResponse>("/superadmin/users-list", {
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
  const payload = {
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    tenantId: data.tenantId,
    isActive: data.isActive,
    password: data.password || "Default@123",
    permissionIds: data.permissionIds || [],
  }
  const res = await api.post("/users/create", payload);
  return res.data;
};

export const updateUserApi = async (data: UserUpsertRequest) => {
  const payload = {
    userId: data.userId,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    tenantId: data.tenantId,
    isActive: data.isActive,
    password: data.password,
    permissionIds: data.permissionIds || [],
  }
  const res = await api.put("/users/update", payload);
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

/*   GET COMPANY LIST   */

export const getCompaniesApi = async () => {
  const res = await api.get("/users/companies");
  return res.data.data; 
};

/*   GET USERS LIST   */

export const getUsersDropdownApi = async () => {
  const res = await api.get("/users/users-dropdown");
  return res.data.data; 
};
