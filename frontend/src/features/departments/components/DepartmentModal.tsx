import { Modal, Button, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreateDepartmentDto } from "../types/departmentTypes";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  locationCode: z.string().min(1, "Location code is required"),
});

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDepartmentDto) => void;
}

export const DepartmentModal = ({ opened, onClose, onSubmit }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDepartmentDto>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = (data: CreateDepartmentDto) => {
    onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create Department">
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
        <Button type="submit" fullWidth>
          Create
        </Button>
      </form>
    </Modal>
  );
};
