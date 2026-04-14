import {
  getDashboardRecent,
  getDashboardStats,
} from "@/features/dashboard/api/dashboardApi";
import { TICKET_STATUS } from "@/features/tickets/constants";
import { formatLocalTime, getTicketStatusColor } from "@/lib/utils";
import {
  Card,
  Grid,
  Paper,
  Skeleton,
  Text,
  Timeline,
  Title,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

export const RequesterDashboard = () => {
  const openStatusColor = getTicketStatusColor(TICKET_STATUS.OPEN);
  const inProgressStatusColor = getTicketStatusColor(TICKET_STATUS.IN_PROGRESS);

  const {
    data: stats,
    isLoading: isLoadingStats,
    isError: isErrorStats,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => getDashboardStats(),
  });

  const { data: recent = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ["dashboardRecent"],
    queryFn: () => getDashboardRecent(5),
  });

  if (isLoadingStats || isLoadingRecent) {
    return (
      <Grid>
        <Grid.Col span={6}>
          <Skeleton height={120} radius="xs" />
        </Grid.Col>
        <Grid.Col span={6}>
          <Skeleton height={120} radius="xs" />
        </Grid.Col>
        <Grid.Col span={12}>
          <Skeleton height={300} radius="xs" />
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
        My Dashboard
      </Title>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Card padding="lg" radius="xs" withBorder bg={`${openStatusColor}.1`}>
            <Text c={`${openStatusColor}.9`} tt="uppercase" fw={700} size="xs">
              My Open Tickets
            </Text>
            <Text fw={700} size="xl" mt="sm" c={`${openStatusColor}.9`}>
              {stats?.openTickets || 0}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
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
              Tickets In Progress
            </Text>
            <Text fw={700} size="xl" mt="sm" c={`${inProgressStatusColor}.9`}>
              {stats?.inProgressTickets || 0}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      <Paper withBorder p="md" radius="xs">
        <Title order={4} mb="xl">
          Recent Updates
        </Title>
        {recent.length > 0 ? (
          <Timeline active={recent.length} bulletSize={24} lineWidth={2}>
            {recent.map((log, idx) => (
              <Timeline.Item key={idx} title={log.action}>
                <Text c="dimmed" size="sm" mt={4}>
                  Ticket #{log.ticketId}: {log.ticketTitle}
                </Text>
                <Text size="xs" mt={4}>
                  By {log.user} • {formatLocalTime(log.timestamp)}
                </Text>
              </Timeline.Item>
            ))}
          </Timeline>
        ) : (
          <Text c="dimmed" ta="center">
            No recent activity.
          </Text>
        )}
      </Paper>
    </div>
  );
};
