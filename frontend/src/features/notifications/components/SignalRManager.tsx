import { useAuthStore } from "@/stores/authStore";
import { notifications as mantineNotifications } from "@mantine/notifications";
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { markNotificationAsRead } from "../api/notificationApi";
import type { NotificationDto } from "../types/notificationTypes";

export function SignalRManager() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "";
    const connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/notifications`, {
        accessTokenFactory: () => useAuthStore.getState().token || "",
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on("ReceiveNotification", (notification: NotificationDto) => {
      queryClient.setQueryData<NotificationDto[]>(
        ["notifications", "latest"],
        (oldData) =>
          oldData ? [notification, ...oldData].slice(0, 10) : [notification],
      );

      mantineNotifications.show({
        id: `notif-${notification.id}`,
        title: "New Update",
        message: notification.message,
        color: "blue",
        styles: { root: { cursor: "pointer" } },
        onClick: () => {
          if (notification.relatedTicketId) {
            mantineNotifications.hide(`notif-${notification.id}`);

            if (notification.message.toLowerCase().includes("approval")) {
              navigate("/app/approvals");
            } else {
              navigate(`/app/tickets/${notification.relatedTicketId}`);
            }

            markNotificationAsRead(notification.id)
              .then(() => {
                queryClient.setQueryData<NotificationDto[]>(
                  ["notifications", "latest"],
                  (oldData) =>
                    oldData?.map((n) =>
                      String(n.id) === String(notification.id)
                        ? { ...n, isRead: true }
                        : n,
                    ) || [],
                );
                queryClient.invalidateQueries({
                  queryKey: ["notifications", "latest"],
                });
              })
              .catch((error) =>
                console.error("Failed to mark notification as read", error),
              );
          }
        },
      });
    });

    const startConnection = async () => {
      try {
        await connection.start();
        if (!isMounted) {
          await connection.stop();
        } else {
          connectionRef.current = connection;
        }
      } catch (err) {
        console.error("SignalR Global Connection Error", err);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, [isAuthenticated, queryClient, navigate]);

  return null;
}
