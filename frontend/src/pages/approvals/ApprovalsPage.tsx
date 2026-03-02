import {
  approveTicket,
  getMyApprovals,
  rejectTicket,
} from "@/features/approvals/api/approvalApi";
import { formatLocalDate, getErrorMessage } from "@/lib/utils";
import {
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Paper,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const ApprovalsPage = () => {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState<number | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");

  const {
    data: approvals = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["approvals"],
    queryFn: getMyApprovals,
  });

  const approveMutation = useMutation({
    mutationFn: approveTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      notifications.show({
        title: "Success",
        message: "Ticket approved",
        color: "green",
      });
    },
    onError: (err) =>
      notifications.show({
        title: "Error",
        message: getErrorMessage(err),
        color: "red",
      }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      notifications.show({
        title: "Success",
        message: "Ticket rejected",
        color: "green",
      });
      handleCloseModal();
    },
    onError: (err) =>
      notifications.show({
        title: "Error",
        message: getErrorMessage(err),
        color: "red",
      }),
  });

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
  };

  const handleOpenRejectModal = (id: number) => {
    setSelectedApprovalId(id);
    setRejectReason("");
    open();
  };

  const handleCloseModal = () => {
    setSelectedApprovalId(null);
    close();
  };

  const submitReject = () => {
    if (selectedApprovalId && rejectReason.trim()) {
      rejectMutation.mutate({
        id: selectedApprovalId,
        data: { reason: rejectReason },
      });
    }
  };

  const rows = approvals.map((app) => (
    <Table.Tr key={app.id}>
      <Table.Td>#{app.ticketId}</Table.Td>
      <Table.Td>{app.ticketTitle}</Table.Td>
      <Table.Td>{app.requesterName}</Table.Td>
      <Table.Td>{formatLocalDate(app.createdAt)}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button
            size="compact-sm"
            color="green"
            onClick={() => handleApprove(app.id)}
            loading={approveMutation.isPending}
          >
            Approve
          </Button>
          <Button
            size="compact-sm"
            color="red"
            variant="light"
            onClick={() => handleOpenRejectModal(app.id)}
          >
            Reject
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  if (isError) return <Text c="red">Error loading approvals.</Text>;

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>My Approvals</Title>
      </Group>

      <Paper p="xs" withBorder pos="relative">
        <LoadingOverlay visible={isLoading} />
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ticket ID</Table.Th>
              <Table.Th>Subject</Table.Th>
              <Table.Th>Requester</Table.Th>
              <Table.Th>Requested On</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        {!isLoading && approvals.length === 0 && (
          <Text ta="center" py="xl" c="dimmed">
            No pending approvals.
          </Text>
        )}
      </Paper>

      <Modal opened={opened} onClose={handleCloseModal} title="Reject Ticket">
        <TextInput
          label="Reason for rejection"
          placeholder="e.g. Too expensive"
          required
          value={rejectReason}
          onChange={(e) => setRejectReason(e.currentTarget.value)}
          mb="md"
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={submitReject}
            loading={rejectMutation.isPending}
            disabled={!rejectReason.trim()}
          >
            Confirm Rejection
          </Button>
        </Group>
      </Modal>
    </div>
  );
};
