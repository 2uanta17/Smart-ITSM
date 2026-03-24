import { getUsers } from "@/features/users/api/userApi";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  LoadingOverlay,
  Modal,
  Select,
  TextInput,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { getAssetTypes } from "../api/assetApi";
import type { Asset, CreateAssetDto } from "../types/assetTypes";

type AssetFormValues = z.infer<typeof schema>;

const schema = z.object({
  assetTag: z.string().min(1, "Tag is required"),
  name: z.string().min(1, "Name is required"),
  serialNum: z.string().optional(),
  typeId: z.string().min(1, "Type is required"),
  assignedUserId: z.string().nullable().optional(),
  status: z.string().optional(),
});

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAssetDto) => void;
  isLoading: boolean;
  initialData?: Asset | null;
  isEditing?: boolean;
}

export const AssetModal = ({
  opened,
  onClose,
  onSubmit,
  isLoading,
  initialData,
  isEditing = false,
}: Props) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      assetTag: "",
      name: "",
      serialNum: "",
      typeId: "",
      assignedUserId: null as string | null,
      status: "InStock",
    },
  });

  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const { data: assetTypes = [], isLoading: isTypesLoading } = useQuery({
    queryKey: ["assetTypes"],
    queryFn: getAssetTypes,
    staleTime: 1000 * 60 * 60,
  });

  const typeOptions = assetTypes.map((t) => ({
    value: t.id.toString(),
    label: t.name,
  }));

  const userOptions = users.map((u) => ({
    value: u.id.toString(),
    label: `${u.fullName} (${u.role})`,
  }));

  const statusOptions = [
    { value: "InStock", label: "In Stock" },
    { value: "InUse", label: "In Use" },
    { value: "Retired", label: "Retired" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Broken", label: "Broken" },
  ];

  useEffect(() => {
    if (initialData) {
      reset({
        assetTag: initialData.assetTag,
        name: initialData.name,
        serialNum: initialData.serialNum || "",
        typeId: initialData.typeId.toString(),
        assignedUserId: initialData.assignedUserId?.toString() || null,
        status: initialData.status || "InStock",
      });
    } else {
      reset({
        assetTag: "",
        name: "",
        serialNum: "",
        typeId: "1",
        assignedUserId: null,
        status: "InStock",
      });
    }
  }, [initialData, opened, reset]);

  const handleFormSubmit = (data: AssetFormValues) => {
    onSubmit({
      ...data,
      serialNum: data.serialNum || "",
      typeId: Number(data.typeId),
      assignedUserId: data.assignedUserId ? Number(data.assignedUserId) : null,
      status: data.status,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit Asset" : "Create Asset"}
    >
      <LoadingOverlay visible={isUsersLoading || isTypesLoading} />
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <TextInput
          label="Asset Tag"
          {...register("assetTag")}
          error={errors.assetTag?.message as string}
          mb="sm"
          disabled={isEditing}
        />
        <TextInput
          label="Name"
          {...register("name")}
          error={errors.name?.message as string}
          mb="sm"
        />
        <TextInput
          label="Serial Number"
          {...register("serialNum")}
          error={errors.serialNum?.message as string}
          mb="sm"
        />
        <Controller
          name="typeId"
          control={control}
          render={({ field }) => (
            <Select
              label="Type"
              data={typeOptions}
              {...field}
              error={errors.typeId?.message as string}
              mb="sm"
            />
          )}
        />
        <Controller
          name="assignedUserId"
          control={control}
          render={({ field }) => (
            <Select
              label="Assign To (Optional)"
              placeholder="Search user..."
              data={userOptions}
              searchable
              clearable
              {...field}
              error={errors.assignedUserId?.message as string}
              mb="md"
            />
          )}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              label="Status"
              data={statusOptions}
              {...field}
              error={errors.status?.message as string}
              mb="md"
            />
          )}
        />

        <Button type="submit" loading={isLoading} fullWidth>
          {isEditing ? "Update Asset" : "Create Asset"}
        </Button>
      </form>
    </Modal>
  );
};
