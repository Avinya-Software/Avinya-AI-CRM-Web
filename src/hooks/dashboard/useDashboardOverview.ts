import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { getDashboardOverviewApi } from "../../api/dashboard.api";

export const useDashboardOverview = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const todayDefault = dayjs().format("YYYY-MM-DD");
  const [fromDate, setFromDate] = useState<string | null>(todayDefault);
  const [toDate, setToDate] = useState<string | null>(todayDefault);

  const fetchDashboard = useCallback(async (from?: string | null, to?: string | null) => {
    try {
      setLoading(true);
      const res = await getDashboardOverviewApi(from, to);
      // res.data is the actual payload based on your JSON structure
      setData(res.data);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load — default to today
  useEffect(() => {
    fetchDashboard(todayDefault, todayDefault);
  }, [fetchDashboard]);

  const applyFilter = () => fetchDashboard(fromDate, toDate);
  const refresh = () => fetchDashboard(fromDate, toDate);
  const clearFilter = () => {
    setFromDate(null);
    setToDate(null);
    fetchDashboard(null, null);
  };
  /** Apply a specific date range atomically (sets state + fetches in one call) */
  const fetchWithDates = (from: string | null, to: string | null) => {
    setFromDate(from);
    setToDate(to);
    fetchDashboard(from, to);
  };

  return { data, loading, refresh, applyFilter, clearFilter, fetchWithDates, fromDate, setFromDate, toDate, setToDate };
};
