import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { Routes, Route, Navigate } from "react-router-dom";
import { DepartmentsPage } from "@/pages/departments/DepartmentsPage";
import { UsersPage } from "@/pages/users/UsersPage";
import { MainLayout } from "@/components/layout/MainLayout";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<MainLayout />}>
          <Route path="dashboard" element={<div>Dashboard</div>} />
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};
