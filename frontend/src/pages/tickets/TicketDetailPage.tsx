import {
  addTicketComment,
  cancelTicket,
  getTicketById,
  getTicketComments,
  getTicketHistory,
  resolveTicket,
  takeTicket,
} from "@/features/tickets/api/ticketApi";
import { TICKET_STATUS } from "@/features/tickets/constants";
import { useTicketCommentsSignalR } from "@/features/tickets/hooks/useTicketCommentsSignalR";
import type { Ticket } from "@/features/tickets/types/ticketTypes";
import {
  formatLocalClockTime,
  formatLocalTime,
  getErrorMessage,
  getPriorityColor,
  getTicketStatusColor,
} from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Grid,
  Group,
  Image,
  LoadingOverlay,
  Paper,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  Textarea,
  Timeline,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const TicketDetailPage = () => {
  const { id } = useParams();
  const ticketId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState("");
  const commentsViewportRef = useRef<HTMLDivElement>(null);

  useTicketCommentsSignalR(ticketId);

  const { data: ticket, isLoading: isLoadingTicket } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicketById(ticketId),
    enabled: !!ticketId,
  });

  const { data: comments = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ["ticketComments", ticketId],
    queryFn: () => getTicketComments(ticketId),
    enabled: !!ticketId,
  });

  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["ticketHistory", ticketId],
    queryFn: () => getTicketHistory(ticketId),
    enabled: !!ticketId,
  });

  const handleSuccess = (message: string) => {
    queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardActionRequired"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardPieChart"] });
    queryClient.invalidateQueries({ queryKey: ["ticketHistory", ticketId] });
    notifications.show({ title: "Success", message, color: "green" });
  };

  const handleError = (error: unknown) => {
    notifications.show({
      title: "Error",
      message: getErrorMessage(error),
      color: "red",
    });
  };

  const updateTicketCaches = (next: {
    status?: string;
    assignedTechId?: number;
    assignedTechName?: string;
  }) => {
    queryClient.setQueryData<Ticket>(["ticket", ticketId], (old) =>
      old
        ? {
            ...old,
            ...next,
          }
        : old,
    );

    queryClient.setQueryData<Ticket[]>(
      ["tickets"],
      (old) =>
        old?.map((item) =>
          item.id === ticketId
            ? {
                ...item,
                ...next,
              }
            : item,
        ) ?? old,
    );
  };

  const takeMutation = useMutation({
    mutationFn: () => takeTicket(ticketId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["ticket", ticketId] });
      await queryClient.cancelQueries({ queryKey: ["tickets"] });

      const previousTicket = queryClient.getQueryData<Ticket>([
        "ticket",
        ticketId,
      ]);
      const previousTickets = queryClient.getQueryData<Ticket[]>(["tickets"]);

      updateTicketCaches({
        status: TICKET_STATUS.IN_PROGRESS,
        assignedTechId: Number(user?.id),
        assignedTechName: "You",
      });

      return { previousTicket, previousTickets };
    },
    onSuccess: () => handleSuccess("You are now working on this ticket."),
    onError: (error, _variables, context) => {
      if (context?.previousTicket) {
        queryClient.setQueryData(["ticket", ticketId], context.previousTicket);
      }
      if (context?.previousTickets) {
        queryClient.setQueryData(["tickets"], context.previousTickets);
      }
      handleError(error);
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () => resolveTicket(ticketId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["ticket", ticketId] });
      await queryClient.cancelQueries({ queryKey: ["tickets"] });

      const previousTicket = queryClient.getQueryData<Ticket>([
        "ticket",
        ticketId,
      ]);
      const previousTickets = queryClient.getQueryData<Ticket[]>(["tickets"]);

      updateTicketCaches({ status: TICKET_STATUS.RESOLVED });
      return { previousTicket, previousTickets };
    },
    onSuccess: () => handleSuccess("Ticket has been resolved."),
    onError: (error, _variables, context) => {
      if (context?.previousTicket) {
        queryClient.setQueryData(["ticket", ticketId], context.previousTicket);
      }
      if (context?.previousTickets) {
        queryClient.setQueryData(["tickets"], context.previousTickets);
      }
      handleError(error);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelTicket(ticketId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["ticket", ticketId] });
      await queryClient.cancelQueries({ queryKey: ["tickets"] });

      const previousTicket = queryClient.getQueryData<Ticket>([
        "ticket",
        ticketId,
      ]);
      const previousTickets = queryClient.getQueryData<Ticket[]>(["tickets"]);

      updateTicketCaches({ status: TICKET_STATUS.CANCELLED });
      return { previousTicket, previousTickets };
    },
    onSuccess: () => handleSuccess("Ticket has been cancelled."),
    onError: (error, _variables, context) => {
      if (context?.previousTicket) {
        queryClient.setQueryData(["ticket", ticketId], context.previousTicket);
      }
      if (context?.previousTickets) {
        queryClient.setQueryData(["tickets"], context.previousTickets);
      }
      handleError(error);
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => addTicketComment(ticketId, commentText),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["ticketComments", ticketId] });
    },
    onError: handleError,
  });

  useEffect(() => {
    if (!commentsViewportRef.current) {
      return;
    }

    commentsViewportRef.current.scrollTo({
      top: commentsViewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [comments]);

  if (isLoadingTicket) return <LoadingOverlay visible />;
  if (!ticket) return <Text>Ticket not found</Text>;

  const apiUrl = import.meta.env.VITE_API_URL;
  const isStaff = user?.role === "Admin" || user?.role === "Technician";
  const isAssignedToMe = ticket.assignedTechId === Number(user?.id);

  return (
    <div>
      <Button variant="subtle" mb="md" onClick={() => navigate("/app/tickets")}>
        ← Back to List
      </Button>

      <Paper p="md" withBorder mb="lg" bg="gray.0">
        <Group justify="space-between">
          <Group>
            <Title order={3}>
              #{ticket.id} - {ticket.title}
            </Title>
            <Badge size="lg" color={getTicketStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
            <Badge size="lg" color={getPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
          </Group>

          <Group>
            {isStaff && ticket.status === TICKET_STATUS.OPEN && (
              <Button
                color="green"
                onClick={() => takeMutation.mutate()}
                loading={takeMutation.isPending}
              >
                Take Ticket
              </Button>
            )}

            {isStaff &&
              ticket.status === TICKET_STATUS.IN_PROGRESS &&
              isAssignedToMe && (
                <Button
                  color="blue"
                  onClick={() => resolveMutation.mutate()}
                  loading={resolveMutation.isPending}
                >
                  Resolve
                </Button>
              )}

            {!isStaff && ticket.status === TICKET_STATUS.OPEN && (
              <Button
                color="red"
                variant="outline"
                onClick={() => cancelMutation.mutate()}
                loading={cancelMutation.isPending}
              >
                Cancel Ticket
              </Button>
            )}
          </Group>
        </Group>
      </Paper>

      <Paper p="xl" withBorder mb="lg">
        <Grid mb="lg">
          <Grid.Col span={4}>
            <Text fw={500} c="dimmed">
              Requester
            </Text>
            <Text>{ticket.requesterName}</Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text fw={500} c="dimmed">
              Category
            </Text>
            <Text>{ticket.categoryName}</Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text fw={500} c="dimmed">
              Assigned Tech
            </Text>
            <Text>{ticket.assignedTechName || "Unassigned"}</Text>
          </Grid.Col>
        </Grid>

        <Text fw={500} c="dimmed" mb="xs">
          Description
        </Text>
        <Paper p="md" bg="gray.0" mb="lg">
          <Text>{ticket.description}</Text>
        </Paper>

        {ticket.attachmentUrl && (
          <>
            <Text fw={500} c="dimmed" mb="xs">
              Attachment
            </Text>
            <Image
              src={`${apiUrl?.replace("/api", "")}/${ticket.attachmentUrl}`}
              w={300}
              alt="Ticket Attachment"
            />
          </>
        )}
      </Paper>

      <Paper p="md" withBorder>
        <Tabs defaultValue="comments">
          <Tabs.List mb="md">
            <Tabs.Tab value="comments">Chat</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="comments">
            <LoadingOverlay visible={isLoadingComments} />
            <ScrollArea
              h={300}
              type="always"
              offsetScrollbars
              p="sm"
              viewportRef={commentsViewportRef}
            >
              <Stack gap="sm">
                {comments.length === 0 ? (
                  <Text c="dimmed" ta="center" mt="xl">
                    No comments yet. Start the conversation!
                  </Text>
                ) : (
                  comments.map((comment) => {
                    const isMine = Number(user?.id) === comment.userId;
                    return (
                      <Group
                        key={comment.id}
                        justify={isMine ? "flex-end" : "flex-start"}
                        align="flex-start"
                        wrap="nowrap"
                      >
                        {!isMine && (
                          <Avatar radius="xl" size="md" color="blue">
                            {comment.userName.charAt(0)}
                          </Avatar>
                        )}
                        <Paper
                          p="sm"
                          bg={isMine ? "blue.6" : "gray.1"}
                          c={isMine ? "white" : "black"}
                          maw="70%"
                        >
                          {!isMine && (
                            <Text size="xs" c="dimmed" mb={4}>
                              {comment.userName}
                            </Text>
                          )}
                          <Text size="sm">{comment.content}</Text>
                          <Text
                            size="xs"
                            c={isMine ? "blue.1" : "dimmed"}
                            ta="right"
                            mt={4}
                          >
                            {formatLocalClockTime(comment.createdAt)}
                          </Text>
                        </Paper>
                      </Group>
                    );
                  })
                )}
              </Stack>
            </ScrollArea>

            <Divider my="sm" />
            <Group align="flex-start">
              <Textarea
                placeholder="Type your message here..."
                flex={1}
                value={commentText}
                onChange={(e) => setCommentText(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (commentText.trim()) commentMutation.mutate();
                  }
                }}
              />
              <Button
                onClick={() => commentMutation.mutate()}
                loading={commentMutation.isPending}
                disabled={!commentText.trim()}
              >
                Send
              </Button>
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="history">
            <LoadingOverlay visible={isLoadingHistory} />
            <ScrollArea h={300} p="md">
              {history.length === 0 ? (
                <Text c="dimmed">No history available for this ticket.</Text>
              ) : (
                <Timeline active={history.length} bulletSize={24} lineWidth={2}>
                  {history.map((log) => (
                    <Timeline.Item key={log.id} title={log.action}>
                      <Text c="dimmed" size="sm">
                        {log.userName} at {formatLocalTime(log.timestamp)}
                      </Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              )}
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </div>
  );
};
