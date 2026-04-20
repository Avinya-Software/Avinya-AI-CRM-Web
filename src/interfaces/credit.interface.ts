// ── Credit User ───────────────────────────────────────────────────────────────
export interface CreditUser {
  id: string;
  userId: string;
  tenantId: string;
  balance: number;
  updatedAt: string | null;
  createdAt: string;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
}

// ── Credit Transaction ────────────────────────────────────────────────────────
export interface CreditTransaction {
  id: string;
  userCreditId: string;
  action: string;
  amount: number;
  description: string | null;
  timestamp: string;
  userId: string | null;
  fullName: string | null;
  email: string | null;
  phoneNumber: string | null;
}

// ── Paged Result wrapper ──────────────────────────────────────────────────────
export interface PagedResult<T> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: T[];
}

// ── API Response Model (outer wrapper) ────────────────────────────────────────
export interface CreditApiResponse<T> {
  statusCode: number;
  statusMessage: string;
  data: PagedResult<T>;
}

// ── Request payload for POST /api/users/credits/list ──────────────────────────
export interface CreditListRequest {
  userId?: string;
  tenantId?: string;
  search?: string;
  pageNumber: number;
  pageSize: number;
}
