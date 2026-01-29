import api from "./axios";

/*   UPSERT   */
export const upsertRenewalApi = async (payload: {
  renewalId?: string;
  policyId: string;
  customerId: string;
  renewalStatusId: number;
  renewalDate: string;
  renewalPremium: number;
  reminderDatesJson: string;
}) => {
  const res = await api.post("/renewals/upsert", payload);
  return res.data;
};

/*   LIST   */
export const getRenewalsApi = async (params: {
  pageNumber: number;
  pageSize: number;
  search?: string;
  renewalStatusId?: number;
}) => {
  const res = await api.get("/renewals", { params });
  return res.data;
};

/*   STATUS DROPDOWN   */
export const getRenewalStatusesApi = async () => {
  const res = await api.get("/renewals/statuses");
  return res.data;
};

export const updateRenewalStatusApi = async (
  renewalId: string,
  statusId: number
) => {
  const res = await api.patch(
    `/renewals/${renewalId}/status/${statusId}`
  );
  return res.data;
};
