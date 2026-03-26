import { changePassword } from "@/features/auth/api/auth";
import {
  changePasswordSchema,
  type ChangePasswordSchema,
} from "@/features/auth/types/schema";
import { getErrorMessage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, PasswordInput, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useForm } from "react-hook-form";

interface ChangePasswordFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function ChangePasswordForm({
  onCancel,
  onSuccess,
}: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordSchema) => {
    try {
      await changePassword(data.oldPassword, data.newPassword);

      notifications.show({
        title: "Success",
        message: "Your password has been changed successfully.",
        color: "green",
        icon: <IconCheck />,
      });

      reset();
      onSuccess();
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message: getErrorMessage(error) || "Failed to change password",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <PasswordInput
          label="Current Password"
          placeholder="Enter your current password"
          required
          {...register("oldPassword")}
          error={errors.oldPassword?.message}
        />

        <PasswordInput
          label="New Password"
          placeholder="Enter your new password"
          required
          {...register("newPassword")}
          error={errors.newPassword?.message}
        />

        <PasswordInput
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          required
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Change Password
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
