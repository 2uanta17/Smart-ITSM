import { Modal, Button, TextInput, Select, PasswordInput } from "@mantine/core";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { CreateUserDto } from "../types/userTypes";
import type { Department } from "@/features/departments/types/departmentTypes";

const schema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .pipe(z.email("Invalid email format")),
  password: z.string().min(6, "Min 6 characters"),
  departmentId: z.string().min(1, "Department is required"),
  role: z.enum(["Admin", "Manager", "Employee"]),
});

interface Props {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto) => void;
  departments: Department[];
  isLoading: boolean;
}

export const UserModal = ({
  opened,
  onClose,
  onSubmit,
  departments,
  isLoading,
}: Props) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "Employee" },
  });

  const handleFormSubmit = (data: any) => {
    onSubmit({ ...data, departmentId: Number(data.departmentId) });
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
    <Modal opened={opened} onClose={handleClose} title="Create User">
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
        <PasswordInput
          label="Password"
          {...register("password")}
          error={errors.password?.message as string}
          mb="sm"
        />
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
              data={["Admin", "Manager", "Employee"]}
              {...field}
              error={errors.role?.message as string}
              mb="md"
            />
          )}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Create User
        </Button>
      </form>
    </Modal>
  );
};
