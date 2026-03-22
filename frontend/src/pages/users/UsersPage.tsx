import { getDepartments } from "@/features/departments/api/departmentApi";
import { createUser, getUsers, updateUser } from "@/features/users/api/userApi";
import { UserModal } from "@/features/users/components/UserModal";
import type {
  CreateUserDto,
  UpdateUserDto,
  User,
} from "@/features/users/types/userTypes";
import { getErrorMessage } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import {
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
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export const UsersPage = () => {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null);

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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({
        title: "Success",
        message: "User updated",
        color: "green",
      });
      handleClose();
    },
    onError: (error) => {
      notifications.show({
        title: "Error",
        message: getErrorMessage(error),
        color: "red",
      });
    },
  });

  const handleCreateOpen = () => {
    setSelectedUser(null);
    open();
  };

  const handleEditOpen = (user: User) => {
    setSelectedUser(user);
    open();
  };

  const handleClose = () => {
    setSelectedUser(null);
    close();
  };

  const handleSubmit = (data: CreateUserDto | UpdateUserDto) => {
    if (selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, data: data as UpdateUserDto });
      return;
    }

    createMutation.mutate(data as CreateUserDto);
  };

  const isLoading = usersQuery.isLoading || departmentsQuery.isLoading;
  const isError = usersQuery.isError || departmentsQuery.isError;

  const roleOptions = ["Admin", "Technician", "Requester"].map((role) => ({
    value: role,
    label: role,
  }));

  const departmentOptions = (departmentsQuery.data || []).map((department) => ({
    value: department.id.toString(),
    label: department.name,
  }));

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return (usersQuery.data || []).filter((u) => {
      if (filterRole && u.role !== filterRole) {
        return false;
      }

      if (filterDepartment && u.departmentId !== Number(filterDepartment)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        u.id.toString().includes(normalizedSearch) ||
        u.fullName.toLowerCase().includes(normalizedSearch) ||
        u.email.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [usersQuery.data, searchQuery, filterRole, filterDepartment]);

  const rows = filteredUsers.map((u) => (
    <Table.Tr key={u.id}>
      <Table.Td>{u.id}</Table.Td>
      <Table.Td>{u.fullName}</Table.Td>
      <Table.Td>{u.email}</Table.Td>
      <Table.Td>{u.role}</Table.Td>
      <Table.Td>{u.departmentName}</Table.Td>
      <Table.Td ta="center">
        <Button variant="light" size="compact-sm" onClick={() => handleEditOpen(u)}>
          Edit
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  if (currentUser?.role !== "Admin") {
    return <Text c="red">You are not authorized to view this page.</Text>;
  }

  if (isError) return <Text c="red">Error loading data.</Text>;

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Users</Title>
        <Button onClick={handleCreateOpen}>Add User</Button>
      </Group>

      <Group mb="md" grow>
        <TextInput
          placeholder="Search by ID, Name, or Email"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
        />
        <Select
          placeholder="Filter by Role"
          data={roleOptions}
          value={filterRole}
          onChange={setFilterRole}
          clearable
        />
        <Select
          placeholder="Filter by Department"
          data={departmentOptions}
          value={filterDepartment}
          onChange={setFilterDepartment}
          clearable
        />
      </Group>

      <Paper p="xs" withBorder pos="relative">
        <LoadingOverlay visible={isLoading} />

        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={60}>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th w={130} ta="center">
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>

        {!isLoading && filteredUsers.length === 0 && (
          <Text ta="center" py="xl" c="dimmed">
            No users found.
          </Text>
        )}
      </Paper>

      <UserModal
        opened={opened}
        onClose={handleClose}
        onSubmit={handleSubmit}
        departments={departmentsQuery.data || []}
        isLoading={createMutation.isPending || updateMutation.isPending}
        initialData={selectedUser}
        isEditing={!!selectedUser}
      />
    </div>
  );
};
