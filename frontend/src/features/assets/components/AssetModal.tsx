import {
  Modal,
  Button,
  TextInput,
  Select,
  LoadingOverlay,
} from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/features/users/api/userApi";
import type { CreateAssetDto, Asset } from "../types/assetTypes";
import { useEffect } from "react";
import { getAssetTypes } from "../api/assetApi";

type AssetFormValues = z.infer<typeof schema>;

const schema = z.object({
  assetTag: z.string().min(1, "Tag is required"),
  name: z.string().min(1, "Name is required"),
  serialNum: z.string().optional(),
  typeId: z.string().min(1, "Type is required"),
  assignedUserId: z.string().nullable().optional(),
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

  useEffect(() => {
    if (initialData) {
      reset({
        assetTag: initialData.assetTag,
        name: initialData.name,
        serialNum: initialData.serialNum || "",
        typeId: initialData.typeId.toString(),
        assignedUserId: initialData.assignedUserId?.toString() || null,
      });
    } else {
      reset({
        assetTag: "",
        name: "",
        serialNum: "",
        typeId: "1",
        assignedUserId: null,
      });
    }
  }, [initialData, opened, reset]);

  const handleFormSubmit = (data: AssetFormValues) => {
    onSubmit({
      ...data,
      serialNum: data.serialNum || "",
      typeId: Number(data.typeId),
      assignedUserId: data.assignedUserId ? Number(data.assignedUserId) : null,
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

        <Button type="submit" loading={isLoading} fullWidth>
          {isEditing ? "Update Asset" : "Create Asset"}
        </Button>
      </form>
    </Modal>
  );
};
