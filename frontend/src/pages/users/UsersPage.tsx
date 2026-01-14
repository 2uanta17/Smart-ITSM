import {
  Table,
  Button,
  Group,
  Title,
  Paper,
  LoadingOverlay,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { getUsers, createUser } from "@/features/users/api/userApi";
import { getDepartments } from "@/features/departments/api/departmentApi";
import type { CreateUserDto } from "@/features/users/types/userTypes";
import { UserModal } from "@/features/users/components/UserModal";
import { getErrorMessage } from "@/lib/utils";

export const UsersPage = () => {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const departmentsQuery = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({
        title: "Success",
        message: "User created",
        color: "green",
      });
      close();
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: getErrorMessage(error),
        color: "red",
      });
    },
  });

  const handleCreate = (data: CreateUserDto) => {
    createMutation.mutate(data);
  };

  const isLoading = usersQuery.isLoading || departmentsQuery.isLoading;
  const isError = usersQuery.isError || departmentsQuery.isError;

  const rows = (usersQuery.data || []).map((u) => (
    <Table.Tr key={u.id}>
      <Table.Td>{u.fullName}</Table.Td>
      <Table.Td>{u.email}</Table.Td>
      <Table.Td>{u.role}</Table.Td>
      <Table.Td>{u.departmentName}</Table.Td>
    </Table.Tr>
  ));

  if (isError) return <Text c="red">Error loading data.</Text>;

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Users</Title>
        {currentUser?.role === "Admin" && (
          <Button onClick={open}>Add User</Button>
        )}
      </Group>

      <Paper p="xs" withBorder pos="relative">
        <LoadingOverlay visible={isLoading} />

        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Department</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Paper>

      <UserModal
        opened={opened}
        onClose={close}
        onSubmit={handleCreate}
        departments={departmentsQuery.data || []}
        isLoading={createMutation.isPending}
      />
    </div>
  );
};
