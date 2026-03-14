import api from "./axios";

/* ================= DASHBOARD OVERVIEW ================= */

export const getDashboardOverviewApi = async () => {
  const res = await api.get("/Dashboard/overview");
  return res.data;
};
