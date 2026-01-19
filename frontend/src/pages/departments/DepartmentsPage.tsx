import { useState } from "react";
import {
  Table,
  Button,
  Group,
  Title,
  Modal,
  Text,
  Paper,
  LoadingOverlay,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDepartments,
  createDepartment,
  deleteDepartment,
} from "@/features/departments/api/departmentApi";
import type { CreateDepartmentDto } from "@/features/departments/types/departmentTypes";
import { DepartmentModal } from "@/features/departments/components/DepartmentModal";
import { useAuthStore } from "@/stores/authStore";

export const DepartmentsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    data: departments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      notifications.show({
        title: "Success",
        message: "Department created",
        color: "green",
      });
      close();
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to create",
        color: "red",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      notifications.show({
        title: "Success",
        message: "Department deleted",
        color: "green",
      });
      setDeleteId(null);
    },
    onError: () => {
      notifications.show({
        title: "Error",
        message: "Failed to delete",
        color: "red",
      });
    },
  });

  const handleCreate = (data: CreateDepartmentDto) => {
    createMutation.mutate(data);
  };

  const executeDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const isAdmin = user?.role === "Admin";

  const rows = departments.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td>{element.id}</Table.Td>
      <Table.Td>{element.name}</Table.Td>
      <Table.Td>{element.locationCode}</Table.Td>
      {isAdmin && (
        <Table.Td ta="center">
          <Button
            variant="light"
            color="red"
            size="compact-sm"
            onClick={() => setDeleteId(element.id)}
            disabled={deleteMutation.isPending && deleteId === element.id}
          >
            Delete
          </Button>
        </Table.Td>
      )}
    </Table.Tr>
  ));

  if (isError) return <Text c="red">Error loading departments.</Text>;

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Departments</Title>
        {isAdmin && <Button onClick={open}>Add Department</Button>}
      </Group>

      <Paper p="xs" withBorder pos="relative">
        <LoadingOverlay visible={isLoading} />

        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={50}>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Location</Table.Th>
              {isAdmin && (
                <Table.Th w={100} ta="center">
                  Actions
                </Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>

        {!isLoading && departments.length === 0 && (
          <Text ta="center" py="xl" c="dimmed">
            No departments found.
          </Text>
        )}
      </Paper>

      <DepartmentModal
        opened={opened}
        onClose={close}
        onSubmit={handleCreate}
      />

      <Modal
        opened={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Confirm Deletion"
        centered
      >
        <Text size="sm">
          Are you sure you want to delete this department? This action cannot be
          undone.
        </Text>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={executeDelete}
            loading={deleteMutation.isPending}
          >
            Delete Department
          </Button>
        </Group>
      </Modal>
    </div>
  );
};
