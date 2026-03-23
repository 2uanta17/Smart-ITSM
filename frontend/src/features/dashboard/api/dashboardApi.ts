import api from "@/lib/axios";
import type {
  ActionRequiredTicket,
  CategoryDistribution,
  DashboardSummary,
  RecentActivity,
} from "../types/dashboardTypes";

export interface DashboardDateRangeParams {
  startDate?: string;
  endDate?: string;
}

const buildDateRangeParams = (params?: DashboardDateRangeParams) => {
  const queryParams: Record<string, string> = {};

  if (params?.startDate) {
    queryParams.startDate = params.startDate;
  }

  if (params?.endDate) {
    queryParams.endDate = params.endDate;
  }

  return queryParams;
};

export const getDashboardStats = async (params?: DashboardDateRangeParams) => {
  const { data } = await api.get<DashboardSummary>("/dashboard/stats", {
    params: buildDateRangeParams(params),
  });
  return data;
};

export const getDashboardPieChart = async (
  params?: DashboardDateRangeParams,
) => {
  const { data } = await api.get<CategoryDistribution[]>(
    "/dashboard/pie-chart",
    {
      params: buildDateRangeParams(params),
    },
  );
  return data;
};

export const getDashboardRecent = async (
  count = 10,
  params?: DashboardDateRangeParams,
) => {
  const { data } = await api.get<RecentActivity[]>("/dashboard/recent", {
    params: { count, ...buildDateRangeParams(params) },
  });
  return data;
};

export const getDashboardActionRequired = async (
  params?: DashboardDateRangeParams,
) => {
  const { data } = await api.get<ActionRequiredTicket[]>(
    "/dashboard/action-required",
    {
      params: buildDateRangeParams(params),
    },
  );
  return data;
};
