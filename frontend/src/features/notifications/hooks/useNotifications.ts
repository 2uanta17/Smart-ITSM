import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLatestNotifications,
  markAllNotificationsAsSeen,
  markNotificationAsRead,
} from "../api/notificationApi";
import type { NotificationDto } from "../types/notificationTypes";

export function useNotifications() {
  const queryClient = useQueryClient();
  const { token, isAuthenticated } = useAuthStore();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications", "latest"],
    queryFn: getLatestNotifications,
    enabled: isAuthenticated && !!token,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: ["notifications", "latest"],
      });
      const previousNotifications = queryClient.getQueryData<NotificationDto[]>(
        ["notifications", "latest"],
      );

      queryClient.setQueryData<NotificationDto[]>(
        ["notifications", "latest"],
        (oldData) =>
          oldData?.map((n) =>
            String(n.id) === String(id) ? { ...n, isRead: true } : n,
          ) || [],
      );
      return { previousNotifications };
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: ["notifications", "latest"],
      });
    },
  });

  // const markAllAsReadMutation = useMutation({
  //   mutationFn: markAllNotificationsAsRead,
  //   onMutate: async () => {
  //     await queryClient.cancelQueries({
  //       queryKey: ["notifications", "latest"],
  //     });
  //     const previousNotifications = queryClient.getQueryData<NotificationDto[]>(
  //       ["notifications", "latest"],
  //     );

  //     queryClient.setQueryData<NotificationDto[]>(
  //       ["notifications", "latest"],
  //       (oldData) => oldData?.map((n) => ({ ...n, isRead: true })) || [],
  //     );

  //     return { previousNotifications };
  //   },
  //   onSettled: () => {
  //     return queryClient.invalidateQueries({
  //       queryKey: ["notifications", "latest"],
  //     });
  //   },
  // });

  const markAllAsSeenMutation = useMutation({
    mutationFn: markAllNotificationsAsSeen,
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["notifications", "latest"],
      });
      const previous = queryClient.getQueryData<NotificationDto[]>([
        "notifications",
        "latest",
      ]);

      queryClient.setQueryData<NotificationDto[]>(
        ["notifications", "latest"],
        (old) => old?.map((n) => ({ ...n, isSeen: true })) || [],
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications", "latest"], context.previous);
      }
    },
    onSettled: () => {
      return queryClient.invalidateQueries({
        queryKey: ["notifications", "latest"],
      });
    },
  });

  return {
    notifications,
    isLoading,
    markAsRead: markAsReadMutation.mutateAsync,
    // markAllAsRead: markAllAsReadMutation.mutateAsync,
    markAllAsSeen: markAllAsSeenMutation.mutateAsync,
  };
}
