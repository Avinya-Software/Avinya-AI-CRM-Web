// src/interfaces/user.interface.ts

export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  tenantId: string;
  tenantName: string;
  isActive: boolean;
  createdAt: string;
  password: string; 
   permissionIds: number[]; 
}

export interface UserFilters {
  pageNumber: number;
  pageSize: number;
  search?: string;
  role?: string;
  tenantId?: string | null;
  isActive?: boolean | null;
}

export interface UserListResponse {
  statusCode: number;
  statusMessage: string;
  data: {
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    data: User[];
  };
}

// Helper type for accessing the nested data
export type UserListData = UserListResponse['data'];

export interface UserUpsertRequest {
  userId?: string;
  fullName: string;
  email: string;
  role: string;
  tenantId: string;
  isActive: boolean;
  password: string;
  permissionIds: number[]; 
}

export interface CompanyDropdownOption {
  tenantId: string;
  companyName: string;
  companyEmail: string;
}

export interface PermissionAction {
  permissionId: number;
  actionKey: string;
  actionName: string;
}

export interface PermissionModule {
  moduleKey: string;
  moduleName: string;
  permissions: PermissionAction[];
}
