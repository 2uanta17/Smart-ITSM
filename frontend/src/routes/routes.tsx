import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { Routes, Route, Navigate } from "react-router-dom";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app/dashboard" element={<div>Dashboard</div>} />
      </Route>

      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};
