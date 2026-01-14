import { LoginForm } from "@/features/auth/components/LoginForm/LoginForm";
import { useAuthStore } from "@/stores/authStore";
import { Navigate } from "react-router-dom";

export const LoginPage = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <LoginForm />;
};