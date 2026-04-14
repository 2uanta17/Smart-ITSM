import {
  getDashboardActionRequired,
  getDashboardPieChart,
  getDashboardRecent,
  getDashboardStats,
} from "@/features/dashboard/api/dashboardApi";
import { TICKET_STATUS } from "@/features/tickets/constants";
import {
  formatLocalDate,
  formatLocalTime,
  getPriorityColor,
  getTicketStatusColor,
} from "@/lib/utils";
import { PieChart } from "@mantine/charts";
import {
  Badge,
  Box,
  Card,
  Grid,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  Skeleton,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CHART_COLORS = ["blue.6", "teal.6", "grape.6", "orange.6", "yellow.6"];
type DatePreset =
  | "all-time"
  | "today"
  | "last-7-days"
  | "this-month"
  | "last-month"
  | "custom";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [datePreset, setDatePreset] = useState<DatePreset>("all-time");
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const openStatusColor = getTicketStatusColor(TICKET_STATUS.OPEN);
  const inProgressStatusColor = getTicketStatusColor(TICKET_STATUS.IN_PROGRESS);
  const resolvedStatusColor = getTicketStatusColor(TICKET_STATUS.RESOLVED);

  const dashboardRange = useMemo(() => {
    const toStartOfDayIso = (date: Date) => {
      const next = new Date(date);
      next.setHours(0, 0, 0, 0);
      return next.toISOString();
    };

    const toEndOfDayIso = (date: Date) => {
      const next = new Date(date);
      next.setHours(23, 59, 59, 999);
      return next.toISOString();
    };

    const now = new Date();

    if (datePreset === "all-time") {
      return {
        startDate: undefined,
        endDate: undefined,
        label: "All-Time",
      };
    }

    if (datePreset === "today") {
      return {
        startDate: toStartOfDayIso(now),
        endDate: now.toISOString(),
        label: "Today",
      };
    }

    if (datePreset === "last-7-days") {
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      return {
        startDate: toStartOfDayIso(start),
        endDate: now.toISOString(),
        label: "Last 7 Days",
      };
    }

    if (datePreset === "this-month") {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: toStartOfDayIso(start),
        endDate: now.toISOString(),
        label: "This Month",
      };
    }

    if (datePreset === "last-month") {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: toStartOfDayIso(start),
        endDate: toEndOfDayIso(end),
        label: "Last Month",
      };
    }

    const customStart = startDateInput
      ? toStartOfDayIso(new Date(startDateInput))
      : undefined;
    const customEnd = endDateInput
      ? toEndOfDayIso(new Date(endDateInput))
      : undefined;

    if (customStart && customEnd && customStart > customEnd) {
      return {
        startDate: customEnd,
        endDate: customStart,
        label: "Custom Range",
      };
    }

    return {
      startDate: customStart,
      endDate: customEnd,
      label: "Custom Range",
    };
  }, [datePreset, startDateInput, endDateInput]);

  const {
    data: stats,
    isLoading: isLoadingStats,
    isFetching: isFetchingStats,
    isError: isErrorStats,
  } = useQuery({
    queryKey: [
      "dashboardStats",
      dashboardRange.startDate ?? null,
      dashboardRange.endDate ?? null,
    ],
    queryFn: () =>
      getDashboardStats({
        startDate: dashboardRange.startDate,
        endDate: dashboardRange.endDate,
      }),
  });

  const {
    data: pieData = [],
    isLoading: isLoadingPie,
    isFetching: isFetchingPie,
  } = useQuery({
    queryKey: [
      "dashboardPieChart",
      dashboardRange.startDate ?? null,
      dashboardRange.endDate ?? null,
    ],
    queryFn: () =>
      getDashboardPieChart({
        startDate: dashboardRange.startDate,
        endDate: dashboardRange.endDate,
      }),
  });

  const {
    data: actionRequired = [],
    isLoading: isLoadingAction,
    isFetching: isFetchingAction,
  } = useQuery({
    queryKey: [
      "dashboardActionRequired",
      dashboardRange.startDate ?? null,
      dashboardRange.endDate ?? null,
    ],
    queryFn: () =>
      getDashboardActionRequired({
        startDate: dashboardRange.startDate,
        endDate: dashboardRange.endDate,
      }),
  });

  const {
    data: recentActivity = [],
    isLoading: isLoadingRecent,
    isFetching: isFetchingRecent,
  } = useQuery({
    queryKey: [
      "dashboardRecent",
      8,
      dashboardRange.startDate ?? null,
      dashboardRange.endDate ?? null,
    ],
    queryFn: () =>
      getDashboardRecent(8, {
        startDate: dashboardRange.startDate,
        endDate: dashboardRange.endDate,
      }),
  });

  const formattedPieData = pieData
    .filter((d) => d.count > 0)
    .map((d, index) => ({
      name: d.categoryName,
      value: d.count,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

  const isInitialLoading =
    isLoadingStats || isLoadingPie || isLoadingAction || isLoadingRecent;
  const isRefreshing =
    (isFetchingStats ||
      isFetchingPie ||
      isFetchingAction ||
      isFetchingRecent) &&
    !isInitialLoading;

  if (isInitialLoading) {
    return (
      <Grid>
        {[1, 2, 3, 4].map((i) => (
          <Grid.Col span={{ base: 12, sm: 3 }} key={i}>
            <Skeleton height={120} radius="xs" />
          </Grid.Col>
        ))}
        <Grid.Col span={6}>
          <Skeleton height={300} radius="xs" />
        </Grid.Col>
        <Grid.Col span={6}>
          <Skeleton height={300} radius="xs" />
        </Grid.Col>
        <Grid.Col span={12}>
          <Skeleton height={280} radius="xs" />
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
    <Box pos="relative">
      <LoadingOverlay
        visible={isRefreshing}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 1 }}
      />
      <Title order={2} mb="lg">
        Overview
      </Title>

      <Paper withBorder p="md" radius="xs" mb="lg">
        <Group align="end" wrap="wrap">
          <Select
            label="Date Range"
            value={datePreset}
            onChange={(value) => {
              const nextPreset = (value as DatePreset | null) ?? "all-time";
              setDatePreset(nextPreset);
            }}
            data={[
              { value: "all-time", label: "All-Time" },
              { value: "today", label: "Today" },
              { value: "last-7-days", label: "Last 7 Days" },
              { value: "this-month", label: "This Month" },
              { value: "last-month", label: "Last Month" },
              { value: "custom", label: "Custom Range" },
            ]}
            w={220}
          />
          <TextInput
            label="Start Date"
            type="date"
            value={startDateInput}
            onChange={(event) => setStartDateInput(event.currentTarget.value)}
            disabled={datePreset !== "custom"}
            w={180}
          />
          <TextInput
            label="End Date"
            type="date"
            value={endDateInput}
            onChange={(event) => setEndDateInput(event.currentTarget.value)}
            disabled={datePreset !== "custom"}
            w={180}
          />
        </Group>
      </Paper>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Card padding="lg" radius="xs" withBorder bg="blue.1">
            <Text c="blue.9" tt="uppercase" fw={700} size="xs">
              Total Tickets
            </Text>
            <Text fw={700} size="xl" mt="sm" c="blue.9">
              {stats?.totalTickets || 0}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Card padding="lg" radius="xs" withBorder bg={`${openStatusColor}.1`}>
            <Text c={`${openStatusColor}.9`} tt="uppercase" fw={700} size="xs">
              Open Tickets
            </Text>
            <Text fw={700} size="xl" mt="sm" c={`${openStatusColor}.9`}>
              {stats?.openTickets || 0}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Card
            padding="lg"
            radius="xs"
            withBorder
            bg={`${inProgressStatusColor}.1`}
          >
            <Text
              c={`${inProgressStatusColor}.9`}
              tt="uppercase"
              fw={700}
              size="xs"
            >
              In Progress
            </Text>
            <Text fw={700} size="xl" mt="sm" c={`${inProgressStatusColor}.9`}>
              {stats?.inProgressTickets || 0}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Card
            padding="lg"
            radius="xs"
            withBorder
            bg={`${resolvedStatusColor}.1`}
          >
            <Text
              c={`${resolvedStatusColor}.9`}
              tt="uppercase"
              fw={700}
              size="xs"
            >
              Resolved
            </Text>
            <Text fw={700} size="xl" mt="sm" c={`${resolvedStatusColor}.9`}>
              {stats?.resolvedTickets || 0}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="md" radius="xs" h="100%">
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
          <Paper withBorder p="md" radius="xs" h="100%">
            <Group justify="space-between" mb="md">
              <Title order={4}>Action Required</Title>
              <Badge color={openStatusColor} variant="light">
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

      <Paper withBorder p="md" radius="xs" mt="lg">
        <Title order={4} mb="md">
          Recent Activity
        </Title>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Activity</Table.Th>
              <Table.Th>Ticket</Table.Th>
              <Table.Th>User</Table.Th>
              <Table.Th>Time</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <Table.Tr
                  key={`${activity.ticketId}-${activity.timestamp}-${index}`}
                >
                  <Table.Td>{activity.action}</Table.Td>
                  <Table.Td
                    style={{ cursor: "pointer", fontWeight: 500 }}
                    onClick={() =>
                      navigate(`/app/tickets/${activity.ticketId}`)
                    }
                  >
                    #{activity.ticketId} - {activity.ticketTitle}
                  </Table.Td>
                  <Table.Td>{activity.user}</Table.Td>
                  <Table.Td>{formatLocalTime(activity.timestamp)}</Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4} ta="center" c="dimmed">
                  No activity found for the selected date range.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Box>
  );
};
