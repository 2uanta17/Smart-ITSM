import { Table, Button, Group, Title, Paper, Badge, LoadingOverlay } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getTickets, getMyTickets } from "@/features/tickets/api/ticketApi";

export const TicketListPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const isStaff = user?.role === "Admin" || user?.role === "Technician";

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: isStaff ? getTickets : getMyTickets
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "green";
      case "Resolved": return "blue";
      case "Closed": return "gray";
      default: return "yellow";
    }
  };

  const rows = tickets.map((t) => (
    <Table.Tr key={t.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/app/tickets/${t.id}`)}>
      <Table.Td>#{t.id}</Table.Td>
      <Table.Td>{t.title}</Table.Td>
      <Table.Td>{t.categoryName}</Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(t.status)}>{t.status}</Badge>
      </Table.Td>
      <Table.Td>{new Date(t.createdAt).toLocaleDateString()}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Tickets</Title>
        <Button onClick={() => navigate("/app/tickets/create")}>New Ticket</Button>
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
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>
    </div>
  );
};