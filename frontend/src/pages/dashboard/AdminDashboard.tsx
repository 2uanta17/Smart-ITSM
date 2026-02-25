import {
  getDashboardActionRequired,
  getDashboardPieChart,
  getDashboardStats,
} from "@/features/dashboard/api/dashboardApi";
import { formatLocalDate, getPriorityColor } from "@/lib/utils";
import { PieChart } from "@mantine/charts";
import {
  Badge,
  Card,
  Grid,
  Group,
  Paper,
  Skeleton,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const CHART_COLORS = ["blue.6", "teal.6", "grape.6", "orange.6", "yellow.6"];

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  const { data: pieData = [], isLoading: isLoadingPie } = useQuery({
    queryKey: ["dashboardPieChart"],
    queryFn: getDashboardPieChart,
  });

  const { data: actionRequired = [], isLoading: isLoadingAction } = useQuery({
    queryKey: ["dashboardActionRequired"],
    queryFn: getDashboardActionRequired,
  });

  const formattedPieData = pieData
    .filter((d) => d.count > 0)
    .map((d, index) => ({
      name: d.categoryName,
      value: d.count,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

  if (isLoadingStats || isLoadingPie || isLoadingAction) {
    return (
      <Grid>
        {[1, 2, 3, 4].map((i) => (
          <Grid.Col span={{ base: 12, sm: 3 }} key={i}>
            <Skeleton height={120} radius="md" />
          </Grid.Col>
        ))}
        <Grid.Col span={6}>
          <Skeleton height={300} radius="md" />
        </Grid.Col>
        <Grid.Col span={6}>
          <Skeleton height={300} radius="md" />
        </Grid.Col>
      </Grid>
    );
  }

  if (isErrorStats) {
    return (
      <Text c="red" ta="center" mt="xl">
        Failed to load dashboard data. Please try refreshing the page.
      </Text>
    );
  }

  return (
    <div>
      <Title order={2} mb="lg">
        Admin Overview
      </Title>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Card padding="lg" radius="md" withBorder bg="blue.1">
            <Text c="blue.9" tt="uppercase" fw={700} size="xs">
              Total Tickets
            </Text>
            <Text fw={700} size="xl" mt="sm" c="blue.9">
              {stats?.totalTickets || 0}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Card padding="lg" radius="md" withBorder bg="red.1">
            <Text c="red.9" tt="uppercase" fw={700} size="xs">
              Open Tickets
            </Text>
            <Text fw={700} size="xl" mt="sm" c="red.9">
              {stats?.openTickets || 0}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Card padding="lg" radius="md" withBorder bg="yellow.1">
            <Text c="yellow.9" tt="uppercase" fw={700} size="xs">
              In Progress
            </Text>
            <Text fw={700} size="xl" mt="sm" c="yellow.9">
              {stats?.inProgressTickets || 0}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Card padding="lg" radius="md" withBorder bg="green.1">
            <Text c="green.9" tt="uppercase" fw={700} size="xs">
              Resolved
            </Text>
            <Text fw={700} size="xl" mt="sm" c="green.9">
              {stats?.resolvedTickets || 0}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <Title order={4} mb="xl">
              Tickets by Category
            </Title>
            {formattedPieData.length > 0 ? (
              <Group justify="center">
                <PieChart
                  data={formattedPieData}
                  withTooltip
                  size={210}
                  strokeWidth={0}
                />
              </Group>
            ) : (
              <Text c="dimmed" ta="center" mt="xl">
                No data available
              </Text>
            )}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <Paper withBorder p="md" radius="md" h="100%">
            <Group justify="space-between" mb="md">
              <Title order={4}>Action Required</Title>
              <Badge color="red" variant="light">
                {stats?.unassignedTickets || 0} Unassigned
              </Badge>
            </Group>

            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Ticket</Table.Th>
                  <Table.Th>Priority</Table.Th>
                  <Table.Th>Created</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {actionRequired.length > 0 ? (
                  actionRequired.map((ticket) => (
                    <Table.Tr
                      key={ticket.ticketId}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/app/tickets/${ticket.ticketId}`)
                      }
                    >
                      <Table.Td fw={500}>
                        #{ticket.ticketId} - {ticket.title}
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{formatLocalDate(ticket.createdAt)}</Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={3} ta="center" c="dimmed">
                      All caught up!
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  );
};
