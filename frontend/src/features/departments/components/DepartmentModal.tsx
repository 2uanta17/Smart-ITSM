import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Modal, TextInput } from "@mantine/core";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { CreateDepartmentDto, Department } from "../types/departmentTypes";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  locationCode: z.string().min(1, "Location code is required"),
});

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDepartmentDto) => void;
  isLoading?: boolean;
  initialData?: Department | null;
  isEditing?: boolean;
}

export const DepartmentModal = ({
  opened,
  onClose,
  onSubmit,
  isLoading = false,
  initialData,
  isEditing = false,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDepartmentDto>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      locationCode: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        locationCode: initialData.locationCode,
      });
    } else {
      reset({
        name: "",
        locationCode: "",
      });
    }
  }, [initialData, opened, reset]);

  const handleFormSubmit = (data: CreateDepartmentDto) => {
    onSubmit(data);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit Department" : "Create Department"}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <TextInput
          label="Name"
          placeholder="IT Support"
          {...register("name")}
          error={errors.name?.message}
          mb="sm"
        />
        <TextInput
          label="Location Code"
          placeholder="HQ-L1"
          {...register("locationCode")}
          error={errors.locationCode?.message}
          mb="md"
        />
        <Button type="submit" fullWidth loading={isLoading}>
          {isEditing ? "Update" : "Create"}
        </Button>
      </form>
    </Modal>
  );
};
