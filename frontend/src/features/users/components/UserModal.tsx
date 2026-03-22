import type { Department } from "@/features/departments/types/departmentTypes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Modal, PasswordInput, Select, TextInput } from "@mantine/core";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { CreateUserDto, UpdateUserDto, User } from "../types/userTypes";

const schema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .pipe(z.email("Invalid email format")),
  password: z.string().optional(),
  departmentId: z.string().min(1, "Department is required"),
  role: z.enum(["Admin", "Technician", "Requester"]),
  isActive: z.boolean(),
});

type UserFormData = z.infer<typeof schema>;

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => void;
  departments: Department[];
  isLoading: boolean;
  initialData?: User | null;
  isEditing?: boolean;
}

export const UserModal = ({
  opened,
  onClose,
  onSubmit,
  departments,
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
  } = useForm<UserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      departmentId: "",
      role: "Requester",
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName,
        email: initialData.email,
        password: "",
        departmentId: initialData.departmentId.toString(),
        role: initialData.role as "Admin" | "Technician" | "Requester",
        isActive: initialData.isActive,
      });
      return;
    }

    reset({
      fullName: "",
      email: "",
      password: "",
      departmentId: "",
      role: "Requester",
      isActive: true,
    });
  }, [initialData, opened, reset]);

  const handleFormSubmit = (data: UserFormData) => {
    if (!isEditing) {
      if (!data.password || data.password.length < 6) {
        return;
      }

      onSubmit({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        departmentId: Number(data.departmentId),
        role: data.role,
      });
      return;
    }

    onSubmit({
      fullName: data.fullName,
      email: data.email,
      departmentId: Number(data.departmentId),
      role: data.role,
      isActive: data.isActive,
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const deptOptions = departments.map((d) => ({
    value: d.id.toString(),
    label: d.name,
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEditing ? "Edit User" : "Create User"}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <TextInput
          label="Full Name"
          {...register("fullName")}
          error={errors.fullName?.message as string}
          mb="sm"
        />
        <TextInput
          label="Email"
          {...register("email")}
          error={errors.email?.message as string}
          mb="sm"
        />
        {!isEditing && (
          <PasswordInput
            label="Password"
            {...register("password", {
              validate: (value) =>
                !!value && value.length >= 6 ? true : "Min 6 characters",
            })}
            error={errors.password?.message as string}
            mb="sm"
          />
        )}
        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <Select
              label="Department"
              data={deptOptions}
              {...field}
              error={errors.departmentId?.message as string}
              mb="sm"
            />
          )}
        />
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              label="Role"
              data={["Admin", "Technician", "Requester"]}
              {...field}
              error={errors.role?.message as string}
              mb="md"
            />
          )}
        />
        {isEditing && (
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Select
                label="Status"
                data={[
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ]}
                value={field.value ? "true" : "false"}
                onChange={(value) => field.onChange(value === "true")}
                mb="md"
              />
            )}
          />
        )}
        <Button type="submit" loading={isLoading} fullWidth>
          {isEditing ? "Update" : "Create User"}
        </Button>
      </form>
    </Modal>
  );
};