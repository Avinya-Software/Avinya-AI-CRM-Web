import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getDashboardOverviewApi } from "../../api/dashboard.api";

export const useDashboardOverview = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardOverviewApi();
      setData(res);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    loading,
    refresh: fetchDashboard,
  };
};
