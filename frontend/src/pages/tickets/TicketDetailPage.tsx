import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Paper,
  Title,
  Text,
  Group,
  Badge,
  Button,
  Divider,
  Grid,
  Image,
  LoadingOverlay,
} from "@mantine/core";
import { getTicketById } from "@/features/tickets/api/ticketApi";

export const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ticket, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicketById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <LoadingOverlay visible />;
  if (!ticket) return <Text>Ticket not found</Text>;

  const apiUrl = import.meta.env.VITE_API_URL;
  return (
    <div>
      <Button variant="subtle" mb="md" onClick={() => navigate("/app/tickets")}>
        ← Back to List
      </Button>

      <Paper p="xl" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>
            #{ticket.id} - {ticket.title}
          </Title>
          <Badge size="lg">{ticket.status}</Badge>
        </Group>

        <Divider mb="lg" />

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
              Priority
            </Text>
            <Text>{ticket.priority}</Text>
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
              radius="md"
              alt="Ticket Attachment"
            />
          </>
        )}
      </Paper>
    </div>
  );
};
