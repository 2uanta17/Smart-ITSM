import type {
  Ticket,
  TicketRealtimeUpdate,
} from "@/features/tickets/types/ticketTypes";
import { useAuthStore } from "@/stores/authStore";
import { Button, Group, Text } from "@mantine/core";
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
  const user = useAuthStore((state) => state.user);
  const connectionRef = useRef<HubConnection | null>(null);

  const openNotificationTarget = (notification: NotificationDto) => {
    if (!notification.relatedTicketId) {
      return;
    }

    mantineNotifications.hide(`notif-${notification.id}`);

    if (notification.message.toLowerCase().includes("approval")) {
      if (user?.role === "Admin") {
        navigate("/app/approvals");
      } else {
        navigate(`/app/tickets/${notification.relatedTicketId}`);
      }
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
  };

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
        message: (
          <Group justify="space-between" align="center" wrap="nowrap">
            <Text size="sm" mr="sm">
              {notification.message}
            </Text>
            {notification.relatedTicketId && (
              <Button
                size="compact-xs"
                variant="light"
                onClick={() => openNotificationTarget(notification)}
              >
                Open
              </Button>
            )}
          </Group>
        ),
        color: "blue",
      });
    });

    connection.on("TicketUpdated", (update: TicketRealtimeUpdate) => {
      queryClient.setQueryData<Ticket[]>(
        ["tickets"],
        (oldData) =>
          oldData?.map((ticket) =>
            ticket.id === update.ticketId
              ? {
                  ...ticket,
                  status: update.status,
                  assignedTechId: update.assignedTechId ?? undefined,
                  assignedTechName: update.assignedTechName ?? undefined,
                }
              : ticket,
          ) ?? oldData,
      );

      queryClient.setQueryData<Ticket>(
        ["ticket", update.ticketId],
        (oldData) =>
          oldData
            ? {
                ...oldData,
                status: update.status,
                assignedTechId: update.assignedTechId ?? undefined,
                assignedTechName: update.assignedTechName ?? undefined,
              }
            : oldData,
      );

      queryClient.invalidateQueries({
        queryKey: ["ticketHistory", update.ticketId],
      });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardActionRequired"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardPieChart"] });
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
  }, [isAuthenticated, queryClient, navigate, user?.role]);

  return null;
}
