import api from "@/lib/axios";
import type { ApprovalDto, RejectDto } from "../types/approvalTypes";

export const getMyApprovals = async (): Promise<ApprovalDto[]> => {
  const { data } = await api.get("/approvals/me");
  return data;
};

export const approveTicket = async (id: number): Promise<void> => {
  await api.patch(`/approvals/${id}/approve`);
};

export const rejectTicket = async ({ id, data }: { id: number; data: RejectDto }): Promise<void> => {
  await api.patch(`/approvals/${id}/reject`, data);
};