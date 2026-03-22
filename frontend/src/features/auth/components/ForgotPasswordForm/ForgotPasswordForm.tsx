import { getErrorMessage } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "../../types/schema";

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await forgotPassword(data.email);
      setEmailSent(true);
      notifications.show({
        title: "Email Sent",
        message: "Password reset link has been sent to your email",
        color: "green",
        icon: <IconCheck />,
      });
    } catch (error: unknown) {
      notifications.show({
        title: "Error",
        message: getErrorMessage(error) || "Failed to send reset email",
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
        {emailSent ? (
          <Stack>
            <Alert
              icon={<IconCheck />}
              color="green"
              title="Check Your Email"
              variant="light"
            >
              A password reset link has been sent to your email address. Please
              check your inbox (or spam folder) and click the link to reset your
              password.
            </Alert>

            <Group justify="space-between" mt={20}>
              <Anchor
                onClick={() => navigate("/auth/login")}
                size="sm"
                component="button"
                c="blue"
              >
                Back to Login
              </Anchor>
            </Group>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <div>
                <Title order={3} size="h4" ta="center">
                  Forgot Password
                </Title>
                <Text c="dimmed" size="sm" ta="center" mt={5}>
                  Enter your email address and we'll send you a link to reset
                  your password
                </Text>
              </div>

              <TextInput
                label="Email"
                placeholder="you@mail.com"
                required
                {...register("email")}
                error={errors.email?.message}
              />

              <Button fullWidth type="submit" loading={isSubmitting}>
                Send Reset Link
              </Button>

              <Group justify="center">
                <Anchor
                  onClick={() => navigate("/auth/login")}
                  size="sm"
                  component="button"
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
