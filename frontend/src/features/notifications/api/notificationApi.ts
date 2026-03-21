import api from "@/lib/axios";
import type { NotificationDto } from "../types/notificationTypes";

export const getUnreadNotifications = async (): Promise<NotificationDto[]> => {
  const response = await api.get("/notifications/unread");
  return response.data;
};

export const getLatestNotifications = async (): Promise<NotificationDto[]> => {
  const response = await api.get("/notifications/latest");
  return response.data;
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsAsSeen = async (): Promise<void> => {
  await api.patch("/notifications/seen-all");
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all");
};


