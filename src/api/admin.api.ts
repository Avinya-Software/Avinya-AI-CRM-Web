import api from "./axios";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdvisorStatusResponse,
  ApiWrapper,
  MenuItem,
  PermissionResponse,
} from "../interfaces/admin.interface";

//   LOGIN  
export const loginAdminApi = async (
  data: AdminLoginRequest
) => {
  const res = await api.post<ApiWrapper<AdminLoginResponse>>(
    "/auth/login",
    data
  );
  return res.data;
};

//   PENDING ADVISORS  
export const getPendingAdvisorsApi = async () => {
  const res = await api.get<ApiWrapper<any[]>>(
    "/admin/pending-advisors"
  );
  return res.data;
};

//   APPROVE USER   
export const approveUserApi = async (
  tenantId: string
) => {
  const res = await api.post<ApiWrapper<string>>(
    `/superadmin/approve-admin?tenantId=${tenantId}`
  );
  return res.data;
};

//   APPROVE ADVISOR  
export const approveAdvisorApi = async (
  userId: string
) => {
  const res = await api.post<ApiWrapper<string>>(
    `/admin/approve/${userId}`
  );
  return res.data;
};

//   DELETE / DISABLE ADVISOR  
export const deleteAdvisorApi = async (
  userId: string
) => {
  const res = await api.delete<ApiWrapper<string>>(
    `/admin/delete/${userId}`
  );
  return res.data;
};
export const getAdvisorsByStatusApi = async (
  status: "approved" | "rejected",
  fromDate?: string,
  toDate?: string
) => {
  const res = await api.get<ApiWrapper<AdvisorStatusResponse[]>>(
    "/admin/advisors-by-status",
    {
      params: {
        status,
        fromDate,
        toDate
      }
    }
  );

  return res.data;
};
// ✅ CORRECT
export const getPendingCompaniesApi = async () => {
  const res = await api.get<ApiWrapper<any[]>>(
    "/admin/pending-companies"
  );
  return res.data;
};

// Get user menu items
export const getUserMenu = async () => {
   const res = await api.get<ApiWrapper<MenuItem[]>>(
    "/users/me/menu"
  );
  return res.data;
};

// Get user permissions
export const getUserPermissions = async () => {
    const res = await api.get<PermissionResponse>(
    "/permission/me/permissions"
  );
  return res.data;
};


