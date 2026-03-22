import { getErrorMessage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "../../types/schema";

interface ResetPasswordFormProps {
  email: string | null;
  token: string | null;
}

export function ResetPasswordForm({ email, token }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!email || !token) {
    return (
      <Container size={420} my={40}>
        <Title ta="center" fw={500}>
          IT Service Management
        </Title>

        <Paper withBorder p={30} mt={30}>
          <Alert icon={<IconAlertCircle />} color="red" variant="light">
            Invalid or missing reset token. Please request a new password reset
            link.
          </Alert>
          <Group justify="center" mt={20}>
            <Anchor
              onClick={() => navigate("/auth/login")}
              size="sm"
              component="button"
              type="button"
              c="blue"
            >
              Back to Login
            </Anchor>
          </Group>
        </Paper>
      </Container>
    );
  }

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      await resetPassword(email, token, data.newPassword);
      setResetSuccess(true);
      notifications.show({
        title: "Success",
        message: "Password has been reset successfully",
        color: "green",
        icon: <IconCheck />,
      });

      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message: getErrorMessage(error) || "Failed to reset password",
        color: "red",
        icon: <IconAlertCircle />,
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={500}>
        IT Service Management
      </Title>

      <Paper withBorder p={30} mt={30}>
        {resetSuccess ? (
          <Stack>
            <Alert
              icon={<IconCheck />}
              color="green"
              title="Password Reset Successful"
              variant="light"
            >
              Your password has been reset. You will be redirected to the login
              page shortly.
            </Alert>

            <Group justify="center" mt={20}>
              <Button onClick={() => navigate("/auth/login")}>
                Go to Login
              </Button>
            </Group>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <div>
                <Title order={3} size="h4">
                  Reset Password
                </Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                  Enter your new password
                </Text>
              </div>

              <PasswordInput
                label="New Password"
                placeholder="Your new password"
                required
                {...register("newPassword")}
                error={errors.newPassword?.message}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your new password"
                required
                mt="xs"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />

              <Button fullWidth type="submit" loading={isSubmitting}>
                Reset Password
              </Button>

              <Group justify="center">
                <Anchor
                  onClick={() => navigate("/auth/login")}
                  size="sm"
                  component="button"
                  type="button"
                  c="blue"
                >
                  Back to Login
                </Anchor>
              </Group>
            </Stack>
          </form>
        )}
      </Paper>
    </Container>
  );
}
