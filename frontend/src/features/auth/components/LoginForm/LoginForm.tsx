import {
  Anchor,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Stack,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { loginSchema, type LoginSchema } from "../../types/schema";
import { loginUser } from "../../api/auth";
import classes from "./LoginForm.module.css";
import { useAuthStore } from "@/stores/authStore";
import { getErrorMessage } from "@/lib/utils";
import { notifications } from "@mantine/notifications";

export function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      const response = await loginUser(data);
      login(response.token);
      notifications.show({
        title: "Welcome back",
        message: "Login successful",
        color: "green",
      });
      navigate("/app/dashboard");
    } catch (error: unknown) {
      notifications.show({
        title: "Authentication Failed",
        message: getErrorMessage(error) || "Invalid email or password",
        color: "red",
      });
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        IT Service Management
      </Title>

      <Paper withBorder p={30} mt={30}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="you@mail.com"
              required
              {...register("email")}
              error={errors.email?.message}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="xs"
              {...register("password")}
              error={errors.password?.message}
            />

            <Group justify="flex-end">
              <Anchor component="button" size="sm">
                Forgot password?
              </Anchor>
            </Group>

            <Button fullWidth type="submit" loading={isSubmitting}>
              Log in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
