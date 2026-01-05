import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
  Alert,
  Stack,
} from "@mantine/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { loginSchema, type LoginSchema } from "../../types/schema";
import { loginUser } from "../../api/auth";
import classes from "./LoginForm.module.css";
import { useAuthStore } from "@/stores/authStore";
import { getErrorMessage } from "@/lib/utils";

export function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginSchema) => {
    setGlobalError("");
    try {
      const response = await loginUser(data);
      login(response.token);
      navigate("/app/dashboard");
    } catch (error: unknown) {
      setGlobalError(getErrorMessage(error) || "Invalid email or password");
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        IT Service Management
      </Title>

      <Paper withBorder p={30} mt={30} radius="0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            {globalError && (
              <Alert color="red" variant="light" title="Authentication Failed">
                {globalError}
              </Alert>
            )}

            <TextInput
              label="Email"
              placeholder="you@mail.com"
              required
              radius="0"
              {...register("email")}
              error={errors.email?.message}
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              radius="0"
              mt="xs"
              {...register("password")}
              error={errors.password?.message}
            />

            <Group justify="flex-end">
              <Anchor component="button" size="sm">
                Forgot password?
              </Anchor>
            </Group>

            <Button fullWidth radius="0" type="submit" loading={isSubmitting}>
              Log in
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
