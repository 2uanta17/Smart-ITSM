import {
  exportTicketsCsv,
  getMyTickets,
  getTickets,
} from "@/features/tickets/api/ticketApi";
import { formatLocalDate, getTicketStatusColor } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  Badge,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Table,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const TicketListPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const isStaff = user?.role === "Admin" || user?.role === "Technician";

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: isStaff ? getTickets : getMyTickets,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  const exportMutation = useMutation({
    mutationFn: exportTicketsCsv,
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "tickets_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notifications.show({
        title: "Export Successful",
        message: "The ticket report has been downloaded to your device.",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Export Failed",
        message: "There was an error generating the CSV report.",
        color: "red",
      });
    },
  });

  const rows = tickets.map((t) => (
    <Table.Tr
      key={t.id}
      style={{ cursor: "pointer" }}
      onClick={() => navigate(`/app/tickets/${t.id}`)}
    >
      <Table.Td>#{t.id}</Table.Td>
      <Table.Td>{t.title}</Table.Td>
      <Table.Td>{t.categoryName}</Table.Td>
      <Table.Td>
        <Badge color={getTicketStatusColor(t.status)}>{t.status}</Badge>
      </Table.Td>
      <Table.Td>{formatLocalDate(t.createdAt)}</Table.Td>
      <Table.Td>{t.dueDate ? formatLocalDate(t.dueDate) : "N/A"}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Tickets</Title>
        <Group>
          {user?.role === "Admin" && (
            <Button
              variant="outline"
              color="gray"
              onClick={() => exportMutation.mutate()}
              loading={exportMutation.isPending}
            >
              Export to Excel
            </Button>
          )}
          <Button onClick={() => navigate("/app/tickets/create")}>
            New Ticket
          </Button>
        </Group>
      </Group>

      <Paper p="xs" withBorder pos="relative">
        <LoadingOverlay visible={isLoading} />
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Due Date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
};
