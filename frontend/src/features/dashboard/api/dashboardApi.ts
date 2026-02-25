import api from "@/lib/axios";
import type {
  ActionRequiredTicket,
  CategoryDistribution,
  DashboardSummary,
  RecentActivity,
} from "../types/dashboardTypes";

export const getDashboardStats = async () => {
  const { data } = await api.get<DashboardSummary>("/dashboard/stats");
  return data;
};

export const getDashboardPieChart = async () => {
  const { data } = await api.get<CategoryDistribution[]>("/dashboard/pie-chart");
  return data;
};

export const getDashboardRecent = async (count = 10) => {
  const { data } = await api.get<RecentActivity[]>("/dashboard/recent", {
    params: { count },
  });
  return data;
};

export const getDashboardActionRequired = async () => {
  const { data } = await api.get<ActionRequiredTicket[]>("/dashboard/action-required");
  return data;
};