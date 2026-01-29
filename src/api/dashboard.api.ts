import api from "./axios";

/* ================= DASHBOARD OVERVIEW ================= */

export const getDashboardOverviewApi = async () => {
  const res = await api.get("/dashboard/overview");
  return res.data;
};
