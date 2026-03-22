import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "@/features/departments/api/departmentApi";
import { DepartmentModal } from "@/features/departments/components/DepartmentModal";
import type {
  CreateDepartmentDto,
  Department,
} from "@/features/departments/types/departmentTypes";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Paper,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const DepartmentsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
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
      handleClose();
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: getErrorMessage(err),
        color: "red",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      notifications.show({
        title: "Success",
        message: "Department updated",
        color: "green",
      });
      handleClose();
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: getErrorMessage(err),
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
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: getErrorMessage(err),
        color: "red",
      });
    },
  });

  const handleOpenCreate = () => {
    setSelectedDepartment(null);
    open();
  };

  const handleOpenEdit = (department: Department) => {
    setSelectedDepartment(department);
    open();
  };

  const handleClose = () => {
    setSelectedDepartment(null);
    close();
  };

  const handleSubmit = (data: CreateDepartmentDto) => {
    if (selectedDepartment) {
      updateMutation.mutate({ id: selectedDepartment.id, data });
    } else {
      createMutation.mutate(data);
    }
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
          <Group gap="xs" justify="center">
            <Button
              variant="light"
              size="compact-sm"
              onClick={() => handleOpenEdit(element)}
              disabled={updateMutation.isPending}
            >
              Edit
            </Button>
            <Button
              variant="light"
              color="red"
              size="compact-sm"
              onClick={() => setDeleteId(element.id)}
              disabled={deleteMutation.isPending && deleteId === element.id}
            >
              Delete
            </Button>
          </Group>
        </Table.Td>
      )}
    </Table.Tr>
  ));

  if (isError) return <Text c="red">Error loading departments.</Text>;

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Departments</Title>
        {isAdmin && <Button onClick={handleOpenCreate}>Add Department</Button>}
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
                <Table.Th w={180} ta="center">
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
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        initialData={selectedDepartment}
        isEditing={!!selectedDepartment}
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
