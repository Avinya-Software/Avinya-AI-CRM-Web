//   REQUESTS  
export interface AdminLoginRequest {
  email: string;
  password: string;
}

//   RESPONSES  
export interface AdminLoginResponse {
  email: string;
  token: string;
  expiresAt: string;
}

//   COMMON API WRAPPER  
export interface ApiWrapper<T> {
  statusCode: number;
  statusMessage: string;
  data: T;
}
export interface AdvisorStatusResponse {
  userId: string;
  advisorId: string;
  fullName: string;
  email: string;
  actionDate: string | null;
  status: "approved" | "rejected";
}

export type Permission = {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type MenuItem = {
  moduleKey: string;
  moduleName: string;
  actions: (
    | "view"
    | "add"
    | "edit"
    | "delete"
    | "assign"
    | "approve"
  )[];
  path: string;
  icon: string;
  order: number;
};

export type PermissionResponse = ApiWrapper<string[]>; 


