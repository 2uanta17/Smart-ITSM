import { useState } from "react";
import {
  Table,
  Button,
  Group,
  Title,
  Paper,
  LoadingOverlay,
  Text,
  Select,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetTypes,
} from "@/features/assets/api/assetApi";
import type { CreateAssetDto, Asset } from "@/features/assets/types/assetTypes";
import { AssetModal } from "@/features/assets/components/AssetModal";
import { getErrorMessage } from "@/lib/utils";

export const AssetsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const { data: assetTypes = [] } = useQuery({
    queryKey: ["assetTypes"],
    queryFn: getAssetTypes,
    staleTime: Infinity,
  });

  const typeOptions = assetTypes.map((t) => ({
    value: t.id.toString(),
    label: t.name,
  }));

  const {
    data: assets = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["assets", filterType],
    queryFn: () => getAssets(filterType ? Number(filterType) : null),
  });

  const createMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      notifications.show({
        title: "Success",
        message: "Asset created",
        color: "green",
      });
      handleClose();
    },
    onError: (err) =>
      notifications.show({
        title: "Error",
        message: getErrorMessage(err),
        color: "red",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: updateAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      notifications.show({
        title: "Success",
        message: "Asset updated",
        color: "green",
      });
      handleClose();
    },
    onError: (err) =>
      notifications.show({
        title: "Error",
        message: getErrorMessage(err),
        color: "red",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      notifications.show({
        title: "Success",
        message: "Asset deleted",
        color: "green",
      });
    },
  });

  const handleOpenCreate = () => {
    setSelectedAsset(null);
    open();
  };

  const handleOpenEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    open();
  };

  const handleClose = () => {
    setSelectedAsset(null);
    close();
  };

  const handleSubmit = (data: CreateAssetDto) => {
    if (selectedAsset) {
      updateMutation.mutate({ id: selectedAsset.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "InUse":
        return "blue";
      case "InStock":
        return "green";
      case "Broken":
        return "red";
      default:
        return "gray";
    }
  };

  const rows = assets.map((asset) => (
    <Table.Tr key={asset.id}>
      <Table.Td>{asset.name}</Table.Td>
      <Table.Td>{asset.assetTag}</Table.Td>
      <Table.Td>{asset.typeName}</Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(asset.status)}>{asset.status}</Badge>
      </Table.Td>
      <Table.Td>{asset.assignedUserName || "-"}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button
            variant="light"
            size="compact-sm"
            onClick={() => handleOpenEdit(asset)}
          >
            Edit/Assign
          </Button>
          {user?.role === "Admin" && (
            <Button
              variant="light"
              color="red"
              size="compact-sm"
              onClick={() => handleDelete(asset.id)}
            >
              Delete
            </Button>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  if (isError) return <Text c="red">Error loading assets.</Text>;

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Assets</Title>
        <Group>
          <Select
            placeholder="Filter by Type"
            data={typeOptions}
            value={filterType}
            onChange={setFilterType}
            clearable
            w={200}
          />
          {user?.role === "Admin" && (
            <Button onClick={handleOpenCreate}>Add Asset</Button>
          )}
        </Group>
      </Group>

      <Paper p="xs" withBorder pos="relative">
        <LoadingOverlay visible={isLoading} />
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Tag</Table.Th>
              <Table.Th>Category</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Assigned To</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        {!isLoading && assets.length === 0 && (
          <Text ta="center" py="xl" c="dimmed">
            No assets found.
          </Text>
        )}
      </Paper>

      <AssetModal
        opened={opened}
        onClose={handleClose}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        initialData={selectedAsset}
        isEditing={!!selectedAsset}
      />
    </div>
  );
};
