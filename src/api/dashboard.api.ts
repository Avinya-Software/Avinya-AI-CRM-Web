import api from "./axios";

/* ================= DASHBOARD OVERVIEW ================= */

export const getDashboardOverviewApi = async (
  fromDate?: string | null,
  toDate?: string | null
) => {
  const params: Record<string, string> = {};
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  const res = await api.get("/Dashboard/overview", { params });
  return res.data;
};
