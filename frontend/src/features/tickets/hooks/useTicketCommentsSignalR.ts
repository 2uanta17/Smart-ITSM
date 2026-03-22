import { parseApiDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  HttpTransportType,
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { TicketComment } from "../types/ticketTypes";

export function useTicketCommentsSignalR(ticketId: number) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !Number.isFinite(ticketId) || ticketId <= 0) return;

    let isMounted = true;
    const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "";

    const connection = new HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/comments`, {
        accessTokenFactory: () => useAuthStore.getState().token || "",
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection.on("ReceiveComment", (comment: TicketComment) => {
      if (comment.ticketId !== ticketId) return;

      queryClient.setQueryData<TicketComment[]>(
        ["ticketComments", ticketId],
        (oldData) => {
          if (!oldData || oldData.length === 0) {
            return [comment];
          }

          const exists = oldData.some((item) => item.id === comment.id);
          if (exists) {
            return oldData;
          }

          return [...oldData, comment].sort(
            (a, b) =>
              parseApiDate(a.createdAt).getTime() -
              parseApiDate(b.createdAt).getTime(),
          );
        },
      );
    });

    const startConnection = async () => {
      try {
        await connection.start();
        await connection.invoke("JoinTicketGroup", ticketId);

        if (!isMounted) {
          await connection.stop();
        } else {
          connectionRef.current = connection;
        }
      } catch (error) {
        console.error("SignalR Comments Connection Error", error);
      }
    };

    startConnection();

    return () => {
      isMounted = false;

      const currentConnection = connectionRef.current;
      connectionRef.current = null;

      if (currentConnection) {
        currentConnection
          .invoke("LeaveTicketGroup", ticketId)
          .catch((error) => console.error("LeaveTicketGroup failed", error))
          .finally(() => {
            currentConnection
              .stop()
              .catch((error) =>
                console.error("Comments hub stop failed", error),
              );
          });
      }
    };
  }, [isAuthenticated, queryClient, ticketId]);
}
