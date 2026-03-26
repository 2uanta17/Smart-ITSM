import {
  exportTicketsCsv,
  getMyTickets,
  getTickets,
} from "@/features/tickets/api/ticketApi";
import type { Ticket } from "@/features/tickets/types/ticketTypes";
import api from "@/lib/axios";
import { formatLocalDate, getTicketStatusColor } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  Badge,
  Button,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  name: string;
}

type TicketSortOption = "newest" | "oldest" | "overdue";

const getCategories = async () => {
  const { data } = await api.get<Category[]>("/categories");
  return data;
};

export const TicketListPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<TicketSortOption>("newest");

  const isStaff = user?.role === "Admin" || user?.role === "Technician";

  const isTicketOverdue = (ticket: Ticket) =>
    Boolean(
      ticket.dueDate &&
      new Date(ticket.dueDate) <= new Date() &&
      ticket.status !== "Resolved" &&
      ticket.status !== "Cancelled",
    );

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: isStaff ? getTickets : getMyTickets,
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: Infinity,
  });

  const categoryOptions = categories.map((category) => ({
    value: category.name,
    label: category.name,
  }));

  const statusOptions = useMemo(
    () =>
      Array.from(new Set(tickets.map((ticket) => ticket.status))).map(
        (status) => ({
          value: status,
          label: status,
        }),
      ),
    [tickets],
  );

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = tickets.filter((ticket) => {
      if (filterStatus && ticket.status !== filterStatus) {
        return false;
      }

      if (filterCategory && ticket.categoryName !== filterCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        ticket.id.toString().includes(normalizedSearch) ||
        ticket.title.toLowerCase().includes(normalizedSearch) ||
        ticket.categoryName.toLowerCase().includes(normalizedSearch) ||
        ticket.status.toLowerCase().includes(normalizedSearch) ||
        ticket.requesterName.toLowerCase().includes(normalizedSearch) ||
        (ticket.assignedTechName || "").toLowerCase().includes(normalizedSearch)
      );
    });

    filtered.sort((a, b) => {
      if (sortBy === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      if (sortBy === "overdue") {
        const aOverdue = isTicketOverdue(a);
        const bOverdue = isTicketOverdue(b);

        if (aOverdue !== bOverdue) {
          return aOverdue ? -1 : 1;
        }

        const aDueTime = a.dueDate
          ? new Date(a.dueDate).getTime()
          : Number.POSITIVE_INFINITY;
        const bDueTime = b.dueDate
          ? new Date(b.dueDate).getTime()
          : Number.POSITIVE_INFINITY;

        if (aDueTime !== bDueTime) {
          return aDueTime - bDueTime;
        }
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [tickets, searchQuery, filterStatus, filterCategory, sortBy]);

  const sortOptions = [
    { value: "newest", label: "Sort: Newest" },
    { value: "oldest", label: "Sort: Oldest" },
    { value: "overdue", label: "Sort: Overdue" },
  ];

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

  const rows = filteredTickets.map((t) => (
    <Table.Tr
      key={t.id}
      style={{
        cursor: "pointer",
        backgroundColor: isTicketOverdue(t)
          ? "var(--mantine-color-red-0)"
          : undefined,
      }}
      onClick={() => navigate(`/app/tickets/${t.id}`)}
    >
      <Table.Td>#{t.id}</Table.Td>
      <Table.Td>{t.title}</Table.Td>
      <Table.Td>{t.categoryName}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Badge color={getTicketStatusColor(t.status)}>{t.status}</Badge>
          {isTicketOverdue(t) && (
            <Badge color="red" variant="light" size="sm">
              Overdue
            </Badge>
          )}
        </Group>
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
          <TextInput
            placeholder="Search by ID, title, category, status..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            w={300}
          />
          <Select
            placeholder="Filter by Status"
            data={statusOptions}
            value={filterStatus}
            onChange={setFilterStatus}
            clearable
            w={200}
          />
          <Select
            placeholder="Filter by Category"
            data={categoryOptions}
            value={filterCategory}
            onChange={setFilterCategory}
            clearable
            w={200}
          />
          <Select
            data={sortOptions}
            value={sortBy}
            onChange={(value) =>
              setSortBy((value as TicketSortOption) || "newest")
            }
            w={180}
          />
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
        {!isLoading && filteredTickets.length === 0 && (
          <Text ta="center" py="xl" c="dimmed">
            No tickets found.
          </Text>
        )}
      </Paper>
    </div>
  );
};
