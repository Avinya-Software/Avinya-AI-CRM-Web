import api from "./axios";
import type {
  CreditApiResponse,
  CreditListRequest,
  CreditTransaction,
  CreditUser,
} from "../interfaces/credit.interface";

/*   GET CREDIT USERS (PAGED — POST)   */

export const getCreditUsersApi = async (payload: CreditListRequest) => {
  const res = await api.post<CreditApiResponse<CreditUser>>(
    "/users/credits/list",
    payload
  );
  return res.data;
};

/*   GET CREDIT TRANSACTIONS FOR A USER (PAGED — GET)   */

export const getCreditTransactionsApi = async (
  userId: string,
  pageNumber: number = 1,
  pageSize: number = 20
) => {
  const res = await api.get<CreditApiResponse<CreditTransaction>>(
    `/users/credits/transactions/${userId}`,
    { params: { pageNumber, pageSize } }
  );
  return res.data;
};

/*   UPDATE USER BALANCE (PUT)   */

export const updateUserBalanceApi = async (userId: string, amount: number) => {
  const res = await api.put(`/users/credits/balance/${userId}`, amount, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};
