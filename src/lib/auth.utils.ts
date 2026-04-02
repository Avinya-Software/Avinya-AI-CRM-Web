import { jwtDecode } from "jwt-decode";

export interface UserClaims {
  userId: string;
  email: string;
  tenantId: string;
  isActive: string;
  role: string;
  fullName?: string;
}

export const decodeUserToken = (token: string | null): UserClaims | null => {
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return {
      userId: decoded.userId || decoded.UserId,
      email: decoded.email,
      tenantId: decoded.tenantId,
      isActive: decoded.isActive,
      role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role,
      fullName: decoded.FullName || decoded.fullName
    };
  } catch (error) {
    console.error("Token decoding failed:", error);
    return null;
  }
};
